const {promisifyExec} = require("../utils/process")
const mintGovernanceToken = async ({address, amount}) => {
  let tokens = require('../tokens.json')

  console.log({amount})
  let command = `spl-token mint ${tokens.hgen.addr} ${amount} ${address}`

  return await promisifyExec(command)
}

module.exports = {
  mintGovernanceToken
}