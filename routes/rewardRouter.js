const express = require('express')
const router = express.Router()
const controller = require('../controllers/rewardController')
const {check, query} = require('express-validator')

router.post('/addReward', [
  check('amount', 'amount is empty').notEmpty()
], controller.addReward)

module.exports = router