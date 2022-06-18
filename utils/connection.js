const { Connection, Account, PublicKey } = require("@solana/web3.js");
const BufferLayout = require("buffer-layout");

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
    return BufferLayout.blob(8, property);
};

const DEPOSIT_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u8("isInitialized"),
    uint64("tokenAmount"),
    uint64("rewardTokenAmount"),
    uint64("rewardGovernanceTokenAmount"),
    uint64("rewardCoinAmount"),
    publicKey("bank"),
    publicKey("governanceBank"),
    publicKey("owner"),
]);

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
]);

let connection = new Connection("https://api.devnet.solana.com", "confirmed");

const anchor = require("@project-serum/anchor");
const nexfin = require("./nexfin.json");

const setup = (connection) => {
    const provider = new anchor.Provider(connection, new Account(require("../rootDir/my_wallet.json")));
    anchor.setProvider(provider);

    // Address of the deployed program
    const escrowProgramId = new anchor.web3.PublicKey(nexfin.metadata.address);

    // Generate program client from IDL
    const escrowProgram = new anchor.Program(nexfin, escrowProgramId);

    return escrowProgram;
}


module.exports = {
    TROVE_ACCOUNT_DATA_LAYOUT,
    DEPOSIT_ACCOUNT_DATA_LAYOUT,
    connection,
    setup,
    programId: "HPwvr8B9KtM3CZwQg7V8pevfgsZfZBLiR3gL1HcEsGiD",
    //   programId: '5uqKRHcKyEJ4Pw4cRVus32a1wfEMGdHpgMa1FLqoQaN8',
    sysAccount: new Account(require("../rootDir/my_wallet.json")),
};
