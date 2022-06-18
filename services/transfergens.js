const {promisifyExec} = require("../utils/process")
const transferToken = async ({address, amount, destination}) => {
  let tokens = require('../tokens.json')

  console.log({amount})
  let command = `spl-token transfer --fund-recipient ${tokens.gens.addr} ${amount} ${destination}`

  return await promisifyExec(command)
}

module.exports = {
  transferToken
}