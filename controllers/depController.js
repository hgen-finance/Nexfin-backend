const {validationResult} = require('express-validator')
let depositModel = require('../models/deposit')
const {getDeposit} = require("../services/deposit")
const {withdrawDeposit, sendSol, claimDepositReward} = require("../services/program")
const {mintToken} = require("../services/gens")
const {BN} = require('bn.js')
const {mintGovernanceToken} = require("../services/hgen")
const {increaseCounters, decreaseCounters} = require("../services/counters")

class depositController {
  async upsert(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let deposit = req.body.deposit

      const depositData = await getDeposit({deposit})

      if (depositData !== null) {
        const user = depositData.owner

        let model = await depositModel.findOrCreateByAddress(user, deposit)

        increaseCounters({
          coin: 0,
          token: 0,
          governance: 0,
          deposit: depositData.tokenAmount,
          trove: 0
        })
        return res.json({model: model})
      }

      res.json({model: null})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async withdraw(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let amount = req.body.amount
      let deposit = req.body.deposit
      deposit = deposit.trim()
      let model = await depositModel.getByDeposit(deposit)

      const depositData = await getDeposit({deposit})

      if (depositData !== null) {
        const oldAmount = (await depositData).tokenAmount
        const withdrawRes = await withdrawDeposit({deposit, amount})
        if (withdrawRes !== null) {
          await mintToken({address: withdrawRes.bank, amount: (oldAmount - withdrawRes.tokenAmount)})

          decreaseCounters({
            coin: 0,
            token: 0,
            governance: 0,
            deposit: amount,
            trove: 0
          })
        }
      }

      res.json({model})

    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async claim(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let deposit = req.body.deposit
      deposit = deposit.trim()
      let model = await depositModel.getByDeposit(deposit)

      const depositData = await getDeposit({deposit})

      if (depositData !== null) {
        const governance = (depositData).rewardGovernanceTokenAmount
        const coin = (depositData).rewardCoinAmount
        const token = (depositData).rewardTokenAmount
        console.log({depositData})

        await mintToken({address: depositData.bank, amount: new BN(token.toString()).toNumber() / 1000000000})
        await mintGovernanceToken({address: depositData.governanceBank, amount: new BN(governance.toString()).toNumber() / 1000000000})
        await sendSol({address: depositData.owner, sol: new BN(coin.toString()).toNumber() / 1000000000})
        console.log(await claimDepositReward({deposit}))
      }

      res.json({model})

    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async getByUserAndDeposit(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors})
      }
      let user = req.query.user
      user = user.trim()
      let model = await depositModel.getByUser(user)

      res.json({model})
    } catch (err) {
      console.log(err)
      res.status(400).json({error: 'Error: ' + err})
    }
  }

  async getList(req, res) {
    try {
      const pageCount = depositModel.pageCount
      const {page = 1, query} = req.query
      const entities = await depositModel.getAll(query)
      const result = []
      
      for (const entity of entities) {
        try {
          const depositData = await getDeposit({deposit: entity.deposit})
          result.push({ ...entity, ...depositData })
        } catch (err) {
          continue
        }
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

}

module.exports = new depositController()