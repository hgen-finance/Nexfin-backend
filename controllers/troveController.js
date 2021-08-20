const {validationResult} = require('express-validator');
var troveModel = require('../models/trove');
const errorLogger = require('../utils/errorLogger')

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

      res.json({model: troveModel});
    } catch (err) {
      console.log(err);
      errorLogger.error(err)
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
      errorLogger.error(err)
      res.status(400).json({error: 'Error: ' + err});
    }
  }

}

module.exports = new troveController();