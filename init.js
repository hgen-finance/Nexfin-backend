const { exec } = require('child_process');
const fs = require('fs');

const promisifyExec = (command) => {
    return new Promise((resolve, reject) => {

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error)
                return;
            }
            resolve(stdout);
        });
    })
}

(async () => {
    const setSolana = 'solana config set --url devnet'
    const res = await promisifyExec(setSolana)
    console.log(res)

    const setSolanaConfig = 'solana config set --keypair ./rootDir/my_wallet.json'
    const resKey = await promisifyExec(setSolanaConfig)
    console.log(resKey)

    if (!fs.existsSync('./tokens.json') && fs.readFileSync('./tokens.json').toString() !== '') {
        // Create gens
        const createTokenCommand = 'spl-token create-token';
        const createGens = await promisifyExec(createTokenCommand);
        const genTokenAddr = createGens.split("\n")[0].replace('Creating token ', '')

        // Create hgen
        const createHgen = await promisifyExec(createTokenCommand);
        const hgenTokenAddr = createHgen.split("\n")[0].replace('Creating token ', '')

        fs.writeFileSync('./tokens.json', JSON.stringify({
            gens: {
                addr: genTokenAddr
            },
            hgen: {
                addr: hgenTokenAddr
            }
        }))
    }
})()
