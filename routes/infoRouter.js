const express = require('express')
const router = express.Router()
const notificationModel = require('../models/notification')

router.get('/', [
], (req, res) => {
  res.json(require('counters.json'))
})

router.post('/email', [
], async (req, res) => {

  const user = req.body.user
  const email = req.body.email

  const model = await notificationModel.create(user,email)

  res.json({model})
})


module.exports = router