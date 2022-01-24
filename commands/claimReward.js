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

  console.log("the depositors are, ", depositors);
  const instructions = []
  console.log("Running add rewards");
  let {amount: depositAmount} = await getDepositCounters()
  depositAmount = new BN(depositAmount)

  for(let {deposit, user} of depositors) {
    try {
      const depositData = await getDeposit({deposit})
      if(depositData === null) {
        await DepositModel.model.deleteOne({deposit})
      } else {
        console.log("Initating adding reward to the depositors account");
       
        const depositSize = new BN(depositData.tokenAmount)
        console.log(`the depfee for token is ${token}`)
        console.log( `the depositors amount is ${depositSize} and the total deposit is ${depositAmount}`);
        if(depositSize == 0){
          continue
        }
        const depositorCoin = coin.mul(depositSize).div(depositAmount).toString()
        const depositorToken = token.mul(depositSize).mul(new BN(100)).div(depositAmount).toString()
        const depositorGovernance = governance.mul(depositSize).div(depositAmount).toString()
        console.log(depositorCoin, depositorToken, depositorGovernance)

        instructions.push(await createAddRewardIx({deposit, coin: depositorCoin, token: depositorToken, governance: depositorGovernance}))
      }
    } catch (e) {
      console.log({e})
    }
  }
  console.log("the transaction returned ", await runAddRewardTransaction({instructions}))

  await RewardModel.create({
    coin: coin.toString(),
    governance: governance.toString(),
    token: token.toString(),
  }, {date: new Date()}, {
    depositors: depositors.length,
    deposit: depositAmount.toString()
  })
}


module.exports = {
  claimReward
}