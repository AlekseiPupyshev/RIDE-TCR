// https://github.com/wavesplatform/waves-transactions/blob/master/test/integration.test.ts
// https://github.com/wavesplatform/waves-transactions/blob/master/src/nodeInteraction.ts
// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2

const seedWithWaves = "sheriff alpha feel salon prosper tackle bracket light mirror famous remind common" //3MtpzbrmeaTCVKkhUGcgZ2nHYPSYUbSfp5A
const dappAddress = "3Ms9dv5wrt3kPXeT2g9yLM2LhS33CT7iuiQ"
let amount = 5000000
let FEE = 500000

let seeds = [1,2,3].map(function(x){
    return "user" + x + seedWithWaves + Math.random()
})
let addresses = seeds.map(function(x){
    return address(x)
})

let defTimeout = 2*20000
describe('Test Initialisation', () => {
    it('Check balance', async function(){
        let amount = await balance(address(seedWithWaves))
        console.log(address(seedWithWaves) + " | balance:" + (amount/100000000).toFixed(3))
    }, defTimeout)
    it('Timetsamp', async function(){
        let tx = await broadcast(data({ data: [{key: "tms", value: dappAddress}]}, seedWithWaves))
        await waitForTx(tx.id)
    }, defTimeout)
    it('Transfer funds forward', async function(){
        var txs = addresses.map(function(x){
            return transfer({amount: 3*amount, recipient: x, fee: FEE}, seedWithWaves)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    }, defTimeout)
    it('Transfer funds back', async function(){
        let txs = seeds.map(function(x){
            return transfer({amount: amount, recipient: address(seedWithWaves), fee: FEE}, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    }, defTimeout)
})

describe('User Invitation', () => {
    it('Invite user 1 from genesis', async function(){
        let genesisSeed = "adapt lizard catalog quote palm enhance economy turkey universe cost excess risk"
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"inviteUser",
                args:[
                    { type:"string", value: addresses[0] }
                ]},
                payment: []
            }, genesisSeed)
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Signup user 1 (from genesis)', async function(){
        let datajson = JSON.stringify({"name": "Aleksei Pupyshev", "title": "🖖 Tech-Entrepreneur, DLT/Blockchain Engineering, Consulting, Advocacy"})
        console.log(datajson)
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"signUp",
                args:[
                    { type:"string", value: datajson }
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Invite user 2 from white list', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"inviteUser",
                args:[
                    { type:"string", value: addresses[1] }
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Signup user 2 (from whitelisted)', async function(){
        let datajson = JSON.stringify({"name": "Ksenia Dovganiuk", "title": "Lead Analyst"})
        console.log(datajson)
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"signUp",
                args:[
                    { type:"string", value: datajson }
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('(!) Invite user 3 (from not whitelisted not genesis)', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"inviteUser",
                args:[
                    { type:"string", value: addresses[2] }
                ]},
                payment: []
            }, seeds[2])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('(!) Signup user 3 (from not whitelisted not genesis)', async function(){
        let datajson = JSON.stringify({"name": "Elon Musk", "title": "Founder of Tesla & SpaceX"})
        console.log(datajson)
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"signUp",
                args:[
                    { type:"string", value: datajson }
                ]},
                payment: []
            }, seeds[2])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
})

describe('dApp Wallet test', () => {
    it('Deposit works', async function(){
        let txs = seeds.map(function(x){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"deposit",
                args:[]},
                payment: [{amount: amount, asset:null }]
            }, x)
        })
        var lastTx = undefined
        for (i = 0+1; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Withdraw works', async function(){
        let txs = seeds.map(function(x){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"withdraw",
                args:[
                    { type:"integer", value: amount}
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0+1; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('(!) Withdraw more than balance', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"withdraw",
                args:[
                    { type:"integer", value: 2*amount}
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('(!) Withdraw from alien account', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"withdraw",
                args:[
                    { type:"integer", value: amount}
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
})

// # (GLOBALS) TCR implementation with commit-reveal scheme
let noIndex = 0
let yesIndex = 1
let tcrCommits = ["7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "ELJFwQv8AVwQ2dYKUnS5w3YvxrecBpRLBVMZxyPqszkb", "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx"]
let tcrReveals = ["00009", "00008", "00009"]
let tcrSaltArr = ["0", "1", "1"]

let maxVoters = 3
let majorityCnt = 2
let newItemFee = amount
let voteItemFee = Math.round(amount/3)

describe('TCR Test', () => {

})
