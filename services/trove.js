const { connection, TROVE_ACCOUNT_DATA_LAYOUT, setup } = require("../utils/connection")
const { PublicKey } = require("@solana/web3.js")
const { BN } = require("bn.js")
const getTrove = async ({ trove }) => {
    // setting anchor program
    let program = await setup(connection);

    let result;
    try {
        result = (await program.account.trove.fetch(new PublicKey(trove)));
        console.log(result, "result");
    } catch (err) {
        console.error(err)
    }
    return {
        troveAccountPubkey: trove,
        isInitialized: result.isInitialized,
        isLiquidated: result.isLiquidated,
        isReceived: result.isReceived,
        borrowAmount: result.borrowAmount.toNumber(),
        lamports: result.lamportsAmount.toString(),
        teamFee: result.teamFee.toString(),
        depositorFee: result.depositorFee.toString(),
        amountToClose: result.amountToClose.toString(),
        owner: result.authority.toBase58(),
    };
}

// const decodeTrove = ({ encodedTroveState, trove }) => {
//     if (!encodedTroveState) {
//         return null
//     }

//     const decodedTroveState = TROVE_ACCOUNT_DATA_LAYOUT.decode(encodedTroveState)

//     return {
//         troveAccountPubkey: trove,
//         isInitialized: !!decodedTroveState.isInitialized,
//         isReceived: !!decodedTroveState.isReceived,
//         isLiquidated: !!decodedTroveState.isLiquidated,
//         borrowAmount: new BN(decodedTroveState.borrowAmount, 10, 'le').toString(),
//         lamports: new BN(decodedTroveState.lamports, 10, 'le').toString(),
//         teamFee: new BN(decodedTroveState.teamFee, 10, 'le').toString(),
//         depositorFee: new BN(decodedTroveState.depositorFee, 10, 'le').toString(),
//         amountToClose: new BN(decodedTroveState.amountToClose, 10, 'le').toString(),
//         owner: new PublicKey(decodedTroveState.owner).toBase58(),
//     }
// }


module.exports = {
    getTrove
}