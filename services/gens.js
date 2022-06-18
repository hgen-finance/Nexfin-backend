const {promisifyExec} = require("../utils/process")
const mintToken = async ({address, amount}) => {
  let tokens = require('../tokens.json')

  console.log({amount})
  let command = `spl-token mint ${tokens.gens.addr} ${amount} ${address}`

  return await promisifyExec(command)
}

module.exports = {
  mintToken
}