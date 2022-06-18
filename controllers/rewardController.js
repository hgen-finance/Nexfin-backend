const { validationResult } = require('express-validator')
const { increaseCounters, decreaseCounters } = require("../services/counters")
const { BN } = require('bn.js')
const { claimReward } = require('../commands/claimReward')


const MIN_DEPOSIT_FEES = 4;
const MIN_TEAM_FEES = 1;
const DEPOSIT_FEE_PERCENT = 1;
const TEAM_FEE_PERCENT = 0.47;

class rewardController {

    async addReward(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: "Error:", errors })
            }

            let amount = req.body.amount

            // TODO refractor this code. Make a separate function to get the dep fee
            let depositorFee = amount * (DEPOSIT_FEE_PERCENT)
            depositorFee = depositorFee < MIN_DEPOSIT_FEES ? MIN_DEPOSIT_FEES : depositorFee

            let teamFee = req.body.amount * (TEAM_FEE_PERCENT / 100)
            teamFee = teamFee < MIN_TEAM_FEES ? MIN_TEAM_FEES : teamFee

            console.log("running....")
            await claimReward({ governance: 0, coin: 0, token: depositorFee }).then(() => {
                console.log("claimed reward")
            })
        } catch (err) {
            console.log(err)
            res.status(400).json({ error: 'Error: ' + err })
        }
    }
}

module.exports = new rewardController()