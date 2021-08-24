const {validationResult} = require('express-validator')
let troveModel = require('../models/trove')
const {mintToken} = require("../services/gens")
const {setTroveReceived, liquidateTrove} = require("../services/program")
const {getTrove} = require("../services/trove")
const {increaseCounters, decreaseCounters} = require("../services/counters")
const {BN} = require('bn.js')

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

      if (!troveData.isReceived) {
        await mintToken({address, amount: troveData.amountToClose - troveData.depositorFee - troveData.teamFee})
        await setTroveReceived({trove})

        increaseCounters({
          coin: 0,
          token: troveData.depositorFee,
          governance: 0,
          deposit: 0,
          trove: troveData.borrowAmount
        })
      }

      res.json({model})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async liquidateTrove(req, res) {
    try {
      let trove = req.body.trove.trim()

      let troveData = await getTrove({trove})

      if (troveData !== null && troveData.isReceived && !troveData.isLiquidated) {
        let oldData = troveData
        troveData = await liquidateTrove({trove})

        if (troveData === null) {
          decreaseCounters({
            coin: 0,
            token: 0,
            governance: 0,
            deposit: 0,
            trove: oldData.borrowAmount
          })

          increaseCounters({
            coin: new BN(oldData.lamports).div(new BN("1000000000")),
            token: 0,
            governance: 0,
            deposit: 0,
            trove: 0
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
      let model = troveModel.getByUser(user)

      res.json({model})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

}

module.exports = new troveController()