const express = require('express');
const router = express.Router();
const controller = require('../controllers/depController');
const {check} = require('express-validator');

router.post('/upsert', [
  check('user', 'user address is empty').notEmpty(),
  check('deposit', 'deposit address is empty').notEmpty()
], controller.upsert);
router.post('/get-by-user-and-deposit', [
  check('user', 'user address is empty').notEmpty(),
  check('deposit', 'deposit address is empty').notEmpty()
], controller.getByUserAndDeposit);

module.exports = router;