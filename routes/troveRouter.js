const express = require('express');
const router = express.Router();
const controller = require('../controllers/troveController');
const {check} = require('express-validator');

router.post('/upsert', [
  check('user', 'user address is empty').notEmpty(),
  check('trove', 'trove address is empty').notEmpty()
], controller.upsert);


router.post('/get-by-user-and-trove', [
  check('user', 'user address is empty').notEmpty(),
  check('trove', 'trove address is empty').notEmpty()
], controller.getByUserAndTrove);


router.post('/liquidate', [
  check('trove', 'trove address is empty').notEmpty()
], controller.liquidateTrove);

module.exports = router;