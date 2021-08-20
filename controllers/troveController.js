const {validationResult} = require('express-validator');
let troveModel = require('../models/trove');

class troveController {
  async upsert(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let user = req.body.user;
      let trove = req.body.trove;
      user = user.trim().toLowerCase();
      trove = trove.trim().toLowerCase();
      let model = troveModel.findOrCreateByAddress(user, trove)

      res.json({model: model});
    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

  async getByUserAndTrove(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({error: "Error:", errors});
      }
      let user = req.body.user;
      let trove = req.body.trove;
      user = user.trim().toLowerCase();
      trove = trove.trim().toLowerCase();
      let model = troveModel.getByUserAndTrove(user, trove)

      res.json({model: troveModel});
    } catch (err) {
      console.log(err);
      res.status(400).json({error: 'Error: ' + err});
    }
  }

}

module.exports = new troveController();