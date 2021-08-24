const {connection, TROVE_ACCOUNT_DATA_LAYOUT} = require("../utils/connection")
const {PublicKey} = require("@solana/web3.js")
const {BN} = require("bn.js")
const getTrove = async ({trove}) => {
  return decodeTrove({
    trove,
    encodedTroveState: (await connection.getAccountInfo(new PublicKey(trove), 'singleGossip'))?.data
  })
}

const decodeTrove = ({encodedTroveState, trove}) => {
  if (!encodedTroveState) {
    return null
  }

  const decodedTroveState = TROVE_ACCOUNT_DATA_LAYOUT.decode(encodedTroveState)

  return {
    troveAccountPubkey: trove,
    isInitialized: !!decodedTroveState.isInitialized,
    isReceived: !!decodedTroveState.isReceived,
    isLiquidated: !!decodedTroveState.isLiquidated,
    borrowAmount: new BN(decodedTroveState.borrowAmount, 10, 'le').toString(),
    lamports: new BN(decodedTroveState.lamports, 10, 'le').toString(),
    teamFee: new BN(decodedTroveState.teamFee, 10, 'le').toString(),
    depositorFee: new BN(decodedTroveState.depositorFee, 10, 'le').toString(),
    amountToClose: new BN(decodedTroveState.amountToClose, 10, 'le').toString(),
    owner: new PublicKey(decodedTroveState.owner).toBase58(),
  }
}


module.exports = {
  getTrove
}