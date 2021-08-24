const {BN} = require('bn.js')
const fs = require("fs")

const increaseCounters = ({
  coin,
  token,
  governance,
  deposit,
  trove
}) => {
  const data = require('../counters.json')

  data.troveTotal = data.troveTotal + trove;
  data.depositTotal = data.depositTotal + deposit;
  data.coin = new BN(data.coin).add(new BN(coin).mul(new BN('1000000000')))
  data.governance = new BN(data.governance).add(new BN(governance).mul(new BN('1000000000')))
  data.token = new BN(data.token).add(new BN(token).mul(new BN('1000000000')))

  fs.writeFileSync('counters.json', JSON.stringify(data))
}

const decreaseCounters = ({
  coin,
  token,
  governance,
  deposit,
  trove
}) => {
  const data = require('../counters.json')

  data.troveTotal = data.troveTotal - trove;
  data.depositTotal = data.depositTotal - deposit;
  data.coin = new BN(data.coin).sub(new BN(coin).mul(new BN('1000000000')))
  data.governance = new BN(data.governance).sub(new BN(governance).mul(new BN('1000000000')))
  data.token = new BN(data.token).sub(new BN(token).mul(new BN('1000000000')))

  fs.writeFileSync('counters.json', JSON.stringify(data))
}

module.exports = {
  increaseCounters,
  decreaseCounters
}