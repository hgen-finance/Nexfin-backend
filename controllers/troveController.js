const {validationResult} = require('express-validator')
const troveModel = require('../models/trove')
const {mintToken} = require("../services/gens")
const {setTroveReceived, liquidateTrove} = require("../services/program")
const {getTrove} = require("../services/trove")
const {increaseCounters, decreaseCounters} = require("../services/counters")
const {BN} = require('bn.js')
const { getCollateral } = require('../utils/helpers')

class troveController {
  async upsert(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let address = req.body.user
      let trove = req.body.trove

      const troveData = await getTrove({trove})

      const user = troveData.owner
      trove = troveData.troveAccountPubkey
      let model = await troveModel.findOrCreateByAddress(user, trove)
      let lamports = 0

      if(!model.amountSent) {
        model.amountSent = troveData.amountToClose - troveData.depositorFee - troveData.teamFee
        model.depositorFee = troveData.depositorFee
        model.teamFee = troveData.teamFee
        lamports = troveData.lamports
      }

      if (!troveData.isReceived) {
        let sentAmount = (troveData.amountToClose - troveData.depositorFee - troveData.teamFee) - model.amountSent

        await mintToken({address, amount:  (sentAmount / 100)})
        await setTroveReceived({trove})

        increaseCounters({
          coin: 0,
          token: troveData.depositorFee - model.depositorFee,
          governance: 0,
          deposit: 0,
          trove: sentAmount,
          collateral: lamports
        })
      }

      res.json({model})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async getList(req, res) {
    try {
      const pageCount = troveModel.pageCount
      const {page = 1, query, sort_field, sort_direction} = req.query
      const entities = await troveModel.getAll(query)
      let result = []
      
      for (const entity of entities) {
        try {
          const troveData = await getTrove({trove: entity.trove})
          result.push({ ...entity, ...troveData })
        } catch (err) {
          continue
        }
      }

      result = result.map(entity => ({
        ...entity,
        debtRatio: `${getCollateral(entity.borrowAmount, entity.lamports, '125')}%`,
      }))

      if (sort_field && sort_direction) {
        result.sort((a, b) => {
          if (a[sort_field] > b[sort_field]) {
            return sort_direction === 'asc' ? 1 : -1
          } else if (a[sort_field] < b[sort_field]) {
            return sort_direction === 'asc' ? -1 : 1
          } else {
            return 0
          }
        })
      }

      res.json({
        entities: result.slice((page - 1) * pageCount, page * pageCount),
        total_count: result.length,
      })
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async liquidateTrove(req, res) {
    try {
      let trove = req.body.trove.trim()

      let troveData = await getTrove({trove})

      const troveModelData = await troveModel.getByTrove(trove)

      if(troveModelData) {
        await troveModel.model.deleteOne({ trove })
      }

      if (troveData !== null && troveData.isReceived && !troveData.isLiquidated) {
        let oldData = troveData
        troveData = await liquidateTrove({trove})

        if (troveData === null) {
          decreaseCounters({
            coin: 0,
            token: 0,
            governance: 0,
            deposit: 0,
            trove: oldData.borrowAmount,
            collateral: oldData.lamports
          })

          increaseCounters({
            coin: new BN(oldData.lamports).div(new BN("1000000000")),
            token: 0,
            governance: 0,
            deposit: 0,
            trove: 0,
            collateral: 0
          })
          return res.json({status: true, trove, troveData})
        }
      }
      res.json({status: false, trove})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async getByUserAndTrove(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let user = req.query.user
      user = user.trim()
      let model = await troveModel.getByUser(user)

      res.json({model})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

}

module.exports = new troveController()