const BN = require('bn.js')

const getCollateral = (gens, lamports, usd) => {
    console.log(`gens: ${gens}, lamports :${lamports}, usd:${usd}`);
    return new BN(lamports).mul(new BN(usd)).div(new BN(gens)).div(new BN(100)).div(new BN("10000000"))
}


module.exports = {
    getCollateral,
}