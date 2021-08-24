const {connection, DEPOSIT_ACCOUNT_DATA_LAYOUT} = require("../utils/connection")
const {PublicKey} = require("@solana/web3.js")
const {BN} = require("bn.js")
const DepositModel = require("../models/deposit")
const getDeposit = async ({deposit}) => {
  return decodeDeposit({
    deposit,
    encodedDepositState: (await connection.getAccountInfo(new PublicKey(deposit), 'singleGossip'))?.data
  })
}

const decodeDeposit = ({encodedDepositState, deposit}) => {
  if (!encodedDepositState) {
    return null
  }

  const decodedDepositState = DEPOSIT_ACCOUNT_DATA_LAYOUT.decode(encodedDepositState)

  return {
    depositAccountPubkey: deposit,
    isInitialized: !!decodedDepositState.isInitialized,
    tokenAmount: new BN(decodedDepositState.tokenAmount, 10, 'le').toNumber(),
    rewardTokenAmount: new BN(decodedDepositState.rewardTokenAmount, 10, 'le').toNumber(),
    rewardGovernanceTokenAmount: new BN(decodedDepositState.rewardGovernanceTokenAmount, 10, 'le').toNumber(),
    rewardCoinAmount: new BN(decodedDepositState.rewardCoinAmount, 10, 'le').toNumber(),
    bank: new PublicKey(decodedDepositState.bank).toBase58(),
    governanceBank: new PublicKey(decodedDepositState.governanceBank).toBase58(),
    owner: new PublicKey(decodedDepositState.owner).toBase58(),
  }
}

const getDepositCounters = async () => {
  const depositors = await DepositModel.model.find().exec()

  const depositorCount = depositors.length
  let depositAmount = 0

  for(let {deposit, user} of depositors) {
    try {
      const depositData = await getDeposit({deposit})

      if(depositData === null) {
        await DepositModel.model.deleteOne({deposit})
      } else {
        depositAmount += depositData.tokenAmount
      }
    } catch (e) {
    }
  }

  return {
    count: depositorCount,
    amount: depositAmount
  }
}

module.exports = {
  getDeposit,
  getDepositCounters
}