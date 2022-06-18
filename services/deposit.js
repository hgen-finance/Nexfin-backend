const { connection, DEPOSIT_ACCOUNT_DATA_LAYOUT, setup } = require("../utils/connection")
const { PublicKey } = require("@solana/web3.js")
const { BN } = require("bn.js")
const DepositModel = require("../models/deposit")
const getDeposit = async ({ deposit }) => {
    let program = await setup(connection)
    let result;
    try {
        result = (await program.account.deposit.fetch(new PublicKey(deposit)));
    } catch (err) {
        console.error(err)
    }

    return {
        depositAccountPubkey: deposit,
        isInitialized: result.isInitialized,
        tokenAmount: result.tokenAmount.toNumber(),
        rewardTokenAmount: result.rewardTokenAmount.toNumber(),
        rewardGovernanceTokenAmount: result.rewardGovernanceTokenAmount.toNumber(),
        rewardCoinAmount: result.rewardCoinAmount.toNumber(),
        bank: result.bank,
        governanceBank: result.governanceBank,
        owner: result.owner,
    }
}

const getDepositCounters = async () => {
    const depositors = await DepositModel.model.find().exec()

    const depositorCount = depositors.length
    let depositAmount = 0

    for (let { deposit, user } of depositors) {
        try {
            const depositData = await getDeposit({ deposit })

            if (depositData === null) {
                await DepositModel.model.deleteOne({ deposit })
            } else {
                console.log("the deposit amount is ", depositData.tokenAmount);
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