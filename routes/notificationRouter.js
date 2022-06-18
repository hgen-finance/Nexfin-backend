const express = require('express')
const router = express.Router()
const controller = require('../controllers/notificationController')
const { check } = require('express-validator')

router.post('/subscribe', [
  check('email', 'Email is empty').notEmpty(),
  check('email', 'Incorrect email address').isEmail(),
], controller.subscribe)

router.post('/send', [
  check('subject', 'Subject is empty').notEmpty(),
  check('body', 'Body is empty').notEmpty(),
  check('debitRatio', 'Debit Ratio is empty').notEmpty(),
], controller.send)

module.exports = router