const { validationResult } = require('express-validator')
const subscribernModel = require('../models/subscriber')
const mailer = require('../services/mailer')

class notificationController {
  async subscribe (req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Error:", errors })
      }

      const email = req.body.email
      const subscriber = await subscribernModel.findOrCreateByEmail(email)

      res.json({ model: subscriber })
    } catch (err) {
      console.log(err)
      res.status(400).json({ error: 'Error: ' + err })
    }
  }

  async send (req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Error:", errors })
      }

      const subscribers = await subscribernModel.getAll()

      await Promise.all(subscribers.map(async ({ email }) => {
        await mailer.sendNotification(email, req.body)
      }))

      res.json({ count: subscribers.length })

    } catch (err) {
      console.log(err)
      res.status(400).json({ error: 'Error: ' + err })
    }
  }

}

module.exports = new notificationController()