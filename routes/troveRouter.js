const express = require('express');
const router = express.Router();
const controller = require('../controllers/troveController');
const {check} = require('express-validator');

router.post('/upsert', [
  check('user', 'user address is empty').notEmpty(),
  check('trove', 'trove address is empty').notEmpty(),
  check('dest', 'destination address is empty').notEmpty()
], controller.upsert);


router.get('/', [
  check('user', 'user address is very empty').notEmpty(),
], controller.getByUserAndTrove);

router.post('/pay', [
  check('trove', 'trove address is empty').notEmpty()
], controller.payBorrow);

router.post('/liquidate', [
  check('trove', 'trove address is empty').notEmpty()
], controller.liquidateTrove);


router.get('/list', [
  check('page', 'trove address is empty').notEmpty()
], controller.getList);

module.exports = router;