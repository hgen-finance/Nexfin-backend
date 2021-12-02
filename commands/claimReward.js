const DepositModel = require('../models/deposit')
const RewardModel = require('../models/reward')
const {getDeposit, getDepositCounters} = require("../services/deposit")
const BN = require("bn.js")
const {createAddRewardIx, runAddRewardTransaction} = require("../services/program")

const claimReward = async ({governance, coin, token}) => {
  const depositors = await DepositModel.model.find().exec()
  governance = new BN(governance)
  coin = new BN(coin)
  token = new BN(token)

  const instructions = []

  let {amount: depositAmount} = await getDepositCounters()
  depositAmount = new BN(depositAmount)

  for(let {deposit, user} of depositors) {
    try {
      const depositData = await getDeposit({deposit})

      if(depositData === null) {
        await DepositModel.model.deleteOne({deposit})
      } else {
        const depositSize = new BN(depositData.tokenAmount)
        const depositorCoin = coin.mul(depositSize).div(depositAmount).toString()
        const depositorToken = token.mul(depositSize).div(depositAmount).toString()
        const depositorGovernance = governance.mul(depositSize).div(depositAmount).toString()
        console.log(depositorCoin, depositorToken, depositorGovernance)
        instructions.push(await createAddRewardIx({deposit, coin: depositorCoin, token: depositorToken, governance: depositorGovernance}))
      }
    } catch (e) {
      console.log({e})
    }
  }
  await runAddRewardTransaction({instructions})

  await RewardModel.create({
    coin: coin.toString(),
    governance: governance.toString(),
    token: token.toString(),
  }, {date: new Date()}, {
    depositors: depositors.length,
    deposit: depositAmount.toString()
  })
}

(() => {
  claimReward({
    governance: 2000000000000,
    coin: 1000000000,
    token: 300000000000
  })
})()