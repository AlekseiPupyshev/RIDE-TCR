// https://github.com/wavesplatform/waves-transactions/blob/master/test/integration.test.ts
// https://github.com/wavesplatform/waves-transactions/blob/master/src/nodeInteraction.ts
// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2



const seedWithWaves = "kick toy ride sorry suit theory fox imitate frown relief thank include"
const nonce = 199420
const dappSeed = "dapp " + nonce + seedWithWaves
const userSeed = "user " + nonce + seedWithWaves
const dappAddress = address(dappSeed)
const userAddress = address(userSeed)

describe('Wallet test suite', () => {
    it('funds dapp account', async function(){
        console.log(dappAddress)
        const ttx = transfer({amount: 5000000, recipient: dappAddress, fee: 100000000}, seedWithWaves)
        await broadcast(ttx)
        let tx = await waitForTx(ttx.id)
        let h = await currentHeight()
        console.log(tx)
        console.log(h)
        expect(h).to.equal(609588);
    })
    it('funds user account', async function(){
        console.log(dappAddress)
        const ttx = transfer({amount: 5000000, recipient: userAddress, fee: 100000000}, seedWithWaves)
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })
})