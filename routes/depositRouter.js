const express = require('express')
const router = express.Router()
const controller = require('../controllers/depController')
const {check} = require('express-validator')

router.post('/upsert', [
  check('deposit', 'deposit address is empty').notEmpty()
], controller.upsert)

router.get('/', [
  check('user', 'user address is empty').notEmpty(),
], controller.getByUserAndDeposit)

router.post('/withdraw', [
  check('amount', 'user address is empty').notEmpty(),
  check('deposit', 'deposit address is empty').notEmpty()
], controller.withdraw)

router.post('/claim', [
  check('deposit', 'deposit address is empty').notEmpty()
], controller.claim)

module.exports = router