const { PublicKey, TransactionInstruction, Transaction, Keypair } = require('@solana/web3.js')
const { sysAccount, programId, connection, setup } = require("../utils/connection")
const { getTrove } = require("./trove")
const { getDeposit } = require("./deposit")
const { BN } = require('bn.js')
const { promisifyExec } = require("../utils/process")
const { bs58 } = require('bs58')

const anchor = require("@project-serum/anchor");

const setTroveReceived = async ({ trove }) => {
    const initializerAccount = sysAccount

    const escrowProgramId = new PublicKey(programId)
    const troveAccount = new PublicKey(trove)

    const closeBorrowIx = new TransactionInstruction({
        programId: escrowProgramId,
        keys: [
            { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: troveAccount, isSigner: false, isWritable: true },
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

    return getTrove({ trove })
}

const liquidateTrove = async ({ trove }) => {

    // setting anchor program
    let program = await setup(connection)

    const initializerAccount = sysAccount
    const escrowProgramId = new PublicKey(programId)
    const troveAccount = new PublicKey(trove)

    // finding a program address for the trove pda
    let [troveAccountPDA, bump_trove] = await PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("borrowertrove"), anchor.getProvider().wallet.publicKey.toBuffer()],
        escrowProgramId
    );

    const liquidateTroveIx = program.instruction.liquidateTrove(
        new anchor.BN(bump_trove), {
        accounts: {
            adminAccountAuthority: initializerAccount.publicKey,
            trove: troveAccount
        }
    })

    const tx = new Transaction()
        .add(liquidateTroveIx)

    // await connection.sendTransaction(tx, [initializerAccount], {
    //   skipPreflight: true,
    //   preflightCommitment: 'singleGossip'
    // })

    await connection.sendTransaction(tx, [initializerAccount])

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return getTrove({ trove })
}

const withdrawDeposit = async ({ deposit, amount }) => {
    const initializerAccount = sysAccount

    console.log("the initializerAccount is ", initializerAccount)
    const depositAccount = new PublicKey(deposit)
    const escrowProgramId = new PublicKey(programId)

    const depositIx = new TransactionInstruction({
        programId: escrowProgramId,
        keys: [
            { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: depositAccount, isSigner: false, isWritable: true },
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

    await new Promise((resolve) => setTimeout(resolve, 5000))

    return getDeposit({ deposit })
}

const claimDepositReward = async ({ deposit }) => {
    const initializerAccount = sysAccount

    const depositAccount = new PublicKey(deposit)
    const escrowProgramId = new PublicKey(programId)

    const depositIx = new TransactionInstruction({
        programId: escrowProgramId,
        keys: [
            { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: depositAccount, isSigner: false, isWritable: true },
        ],
        data: Buffer.from(
            Uint8Array.of(8,
            ))
    })

    const tx = new Transaction()
        .add(depositIx)

    await connection.sendTransaction(tx, [initializerAccount], {
        skipPreflight: true,
        preflightCommitment: 'singleGossip'
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return getDeposit({ deposit })
}

//TODO add the sys account as singer later when we have add private rpc pool
const createAddRewardIx = async ({ deposit, coin, governance, token }) => {
    // setting anchor program
    let program = await setup(connection)

    const initializerAccount = sysAccount

    let tx;
    try {
        tx = new TransactionInstruction(program.instruction.addDepositReward(new anchor.BN(coin), new anchor.BN(governance), new anchor.BN(token), {
            accounts: {
                deposit: new PublicKey(deposit),
            }
        }));
    } catch (err) {
        console.error(err)
    }
    return tx;
}

const runAddRewardTransaction = async ({ instructions }) => {

    let chunkInstructions

    while (instructions.length > 0) {

        chunkInstructions = instructions.splice(0, 10)

        const initializerAccount = sysAccount
        const tx = new Transaction().add(...chunkInstructions)

        await connection.sendTransaction(tx, [initializerAccount])
    }

    return true
}

const sendSol = async ({ address, sol }) => {
    console.log({ sol })
    let command = `solana transfer ${address} ${sol}`

    return await promisifyExec(command)
}

module.exports = {
    setTroveReceived,
    liquidateTrove,
    withdrawDeposit,
    createAddRewardIx,
    runAddRewardTransaction,
    sendSol,
    claimDepositReward
}