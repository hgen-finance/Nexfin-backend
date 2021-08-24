const {validationResult} = require('express-validator');
let depositModel = require('../models/deposit');
const {getDeposit} = require("../services/deposit")
const {withdrawDeposit} = require("../services/program")
const {mintToken} = require("../services/gens")

class depositController {
  async upsert(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let deposit = req.body.deposit;

      const depositData = await getDeposit({deposit})

      if(depositData !== null) {
        const user = depositData.owner

        let model = await depositModel.findOrCreateByAddress(user, deposit)

        return res.json({model: model});
      }

      res.json({model: null})
    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

  async withdraw(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let amount = req.body.amount;
      let deposit = req.body.deposit;
      deposit = deposit.trim();
      let model = await depositModel.getByDeposit(deposit)

      const depositData = getDeposit({deposit})

      if(depositData !== null) {
        const oldAmount = (await depositData).tokenAmount
        const withdrawRes = await withdrawDeposit({deposit, amount})
        if(withdrawRes !== null) {
          console.log({withdrawRes})

          await mintToken({address: withdrawRes.bank, amount: (oldAmount - withdrawRes.tokenAmount)})
        }
      }

      res.json({model});

    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

  async getByUserAndDeposit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let user = req.body.user;
      let deposit = req.body.deposit;
      user = user.trim();
      deposit = deposit.trim();
      let model = depositModel.getByUserAndDeposit(user, deposit)

      res.json({model: depositModel});
    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

}

module.exports = new depositController();