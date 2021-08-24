const {Connection, Account} = require("@solana/web3.js")
const BufferLayout = require("buffer-layout")

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property)
}

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property)
}

const DEPOSIT_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  uint64("tokenAmount"),
  uint64("rewardTokenAmount"),
  uint64("rewardGovernanceTokenAmount"),
  uint64("rewardCoinAmount"),
  publicKey("bank"),
  publicKey("governanceBank"),
  publicKey("owner"),
])

const TROVE_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("isReceived"),
  BufferLayout.u8("isLiquidated"),
  uint64("borrowAmount"),
  uint64("lamports"),
  uint64("teamFee"),
  uint64("depositorFee"),
  uint64("amountToClose"),
  publicKey("owner"),
])
let connection = new Connection("https://api.devnet.solana.com")

module.exports = {
  TROVE_ACCOUNT_DATA_LAYOUT,
  DEPOSIT_ACCOUNT_DATA_LAYOUT,
  connection,
  programId: '5uqKRHcKyEJ4Pw4cRVus32a1wfEMGdHpgMa1FLqoQaN8',
  sysAccount: new Account(require("../rootDir/my_wallet.json"))
}