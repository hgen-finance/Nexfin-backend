const {exec} = require("child_process")


const promisifyExec = (command) => {
  return new Promise((resolve, reject) => {

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  })
}

module.exports = {
  promisifyExec
}