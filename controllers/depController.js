const {validationResult} = require('express-validator');
let depositModel = require('../models/deposit');

class depositController {
  async upsert(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let user = req.body.user;
      let deposit = req.body.deposit;
      user = user.trim().toLowerCase();
      deposit = deposit.trim().toLowerCase();
      let model = depositModel.findOrCreateByAddress(user, deposit)

      res.json({model: model});
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
      user = user.trim().toLowerCase();
      deposit = deposit.trim().toLowerCase();
      let model = depositModel.getByUserAndDeposit(user, deposit)

      res.json({model: depositModel});
    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

}

module.exports = new depositController();