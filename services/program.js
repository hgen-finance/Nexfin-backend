const {PublicKey, TransactionInstruction, Transaction} = require('@solana/web3.js')
const {sysAccount, programId, connection} = require("../utils/connection")
const {getTrove} = require("./trove")
const {getDeposit} = require("./deposit")
const {BN} = require('bn.js')

const setTroveReceived = async ({trove}) => {
  const initializerAccount = sysAccount

  const escrowProgramId = new PublicKey(programId)
  const troveAccount = new PublicKey(trove)

  const closeBorrowIx = new TransactionInstruction({
    programId: escrowProgramId,
    keys: [
      {pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false},
      {pubkey: troveAccount, isSigner: false, isWritable: true},
    ],
    data: Buffer.from(
      Uint8Array.of(9, // id of instruction
      ))
  })

  const tx = new Transaction()
  .add(closeBorrowIx)

  await connection.sendTransaction(tx, [initializerAccount], {
    skipPreflight: true,
    preflightCommitment: 'singleGossip'
  })

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return getTrove({trove})
}

const liquidateTrove = async ({trove}) => {
  const initializerAccount = sysAccount

  const escrowProgramId = new PublicKey(programId)
  const troveAccount = new PublicKey(trove)

  const liquidateTroveIx = new TransactionInstruction({
    programId: escrowProgramId,
    keys: [
      {pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false},
      {pubkey: troveAccount, isSigner: false, isWritable: true},
      {pubkey: initializerAccount.publicKey, isSigner: false, isWritable: true},
    ],
    data: Buffer.from(
      Uint8Array.of(2, // id of instruction
      ))
  })

  const tx = new Transaction()
  .add(liquidateTroveIx)

  await connection.sendTransaction(tx, [initializerAccount], {
    skipPreflight: true,
    preflightCommitment: 'singleGossip'
  })

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return getTrove({trove})
}

const withdrawDeposit = async ({deposit, amount}) => {
  const initializerAccount = sysAccount

  const depositAccount = new PublicKey(deposit)
  const escrowProgramId = new PublicKey(programId)

  const depositIx = new TransactionInstruction({
    programId: escrowProgramId,
    keys: [
      {pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false},
      {pubkey: depositAccount, isSigner: false, isWritable: true},
    ],
    data: Buffer.from(
      Uint8Array.of(7,
        ...new BN(amount).toArray('le', 8),
      ))
  })

  const tx = new Transaction()
  .add(depositIx)

  await connection.sendTransaction(tx, [initializerAccount], {
    skipPreflight: true,
    preflightCommitment: 'singleGossip'
  })

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return getDeposit({deposit})
}

module.exports = {
  setTroveReceived,
  liquidateTrove,
  withdrawDeposit
}