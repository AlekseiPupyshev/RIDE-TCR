// https://github.com/wavesplatform/waves-transactions/blob/master/test/integration.test.ts
// https://github.com/wavesplatform/waves-transactions/blob/master/src/nodeInteraction.ts
// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2

const seedWithWaves = "adapt lizard catalog quote palm enhance economy turkey universe cost excess risk" //3Ms9dv5wrt3kPXeT2g9yLM2LhS33CT7iuiQ
const dappAddress = "3Mxk4AzuXXbmDH4LWqLVAypSXyATYxJLDis"
let amount = 5000000
let FEE = 500000


let seeds = [1,2,3].map(function(x){
    return "user" + x + seedWithWaves + Math.random()
})
let addresses = seeds.map(function(x){
    return address(x)
})

let genesisSeed = "adapt lizard catalog quote palm enhance economy turkey universe cost excess risk"

let defTimeout = 2*20000
describe('Test Initialisation', () => {
    it('Check balance', async function(){
        let amount = await balance(address(seedWithWaves))
        console.log(address(seedWithWaves) + " | balance:" + (amount/100000000).toFixed(3))
    }, defTimeout)
    it('Timetsamp', async function(){
        let tx = await broadcast(data({ data: [{key: "tms", value: dappAddress}], fee: FEE}, seedWithWaves))
        await waitForTx(tx.id)
    }, defTimeout)
    it('Transfer funds forward', async function(){
        var txs = addresses.map(function(x){
            return transfer({amount: 10*amount, recipient: x, fee: FEE}, seedWithWaves)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            console.log((i+1) + ') address : ' + addresses[i]);
            console.log((i+1) + ') seed : ' + seeds[i]);
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
                payment: [{amount: 2*amount, asset:null }]
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
    it('(!) Deposit from not white listed works', async function(){
        var lastTx = invokeScript({
                dApp: dappAddress,
                call:{
                    function:"deposit",
                    args:[]},
                    payment: [{amount: 2*amount, asset:null }]
            }, seeds[2])
        await broadcast(lastTx)
        await waitForTx(lastTx.id)
    })
})
describe('Invite 3th user and deposit for 1th', () => {
    it('Invite user 3 from genesis', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"inviteUser",
                args:[
                    { type:"string", value: addresses[2] }
                ]},
                payment: []
            }, genesisSeed)
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Signup user 3 (from genesis)', async function(){
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
            }, seeds[2])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Deposit 3th user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"deposit",
                args:[
                ]},
                payment: [{amount: amount, asset:null }]
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
})

// # (GLOBALS) TCR implementation with commit-reveal scheme
let maxVoters = 3
let majorityCnt = 2
let newItemFee = amount
let voteItemFee = Math.round(amount/3)
let itemData = JSON.stringify({
    "title": "San Francisco Blockchain Week (SFBW) 2019",
    "description": "San Francisco Blockchain Week is a week of free educational, consumer, and developer focused events that aim to push the boundaries of local blockchain ...",
    "link": "https://sfblockchainweek.io/"
})

describe('TCR Test 2/3 YES => YES', () => {
    let tcrCommits = ["7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "ELJFwQv8AVwQ2dYKUnS5w3YvxrecBpRLBVMZxyPqszkb", "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx"]
    let tcrReveals = ["0", "1", "1"]
    let tcrSaltArr = ["00009", "00008", "00009"]
    let itemId = "tcr_item_id_" + Math.random()

    it('Add new item from whitelisted user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"addItem",
                args:[
                    { type:"string", value: itemId},
                    { type:"integer", value: 3},
                    { type:"integer", value: 5},
                    { type:"integer", value: 7},
                    { type:"string", value: itemData}
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
        console.log('tcr-item-id: ' + itemId);
    })
    it('Vote commits 2 YES and 1 NO', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteCommit",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrCommits[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Vote reveal NO', async function(){
        this.timeout(30000);
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[0] },
                    { type:"string", value: tcrSaltArr[0] },
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('(!) Try to close voting after 1st (1/3) NO reveal', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"checkResults",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[0] },
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('(!) Try to expire voting after 1st (1/3) NO reveal, for author account, by NO-user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"closeExpiredChallenge",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[1] },
                ]},
                payment: []
            }, seeds[0])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Vote reveal 2 YES', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[i] },
                    { type:"string", value: tcrSaltArr[i] },
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
    it('Check results', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"checkResults",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
})

describe('TCR Test 2/3 NO => NO', () => {
    let tcrCommits = ["7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx"]
    let tcrReveals = ["0", "0", "1"]
    let tcrSaltArr = ["00009", "00009", "00009"]
    let itemId = "tcr_item_id_" + Math.random()

    it('Add new item from whitelisted user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"addItem",
                args:[
                    { type:"string", value: itemId},
                    { type:"integer", value: 3},
                    { type:"integer", value: 5},
                    { type:"integer", value: 7},
                    { type:"string", value: itemData}
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
        console.log('tcr-item-id: ' + itemId);
    })
    it('Vote commits 2 NO and 1 YES', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteCommit",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrCommits[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Vote reveal YES', async function(){
        this.timeout(30000);
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[2] },
                    { type:"string", value: tcrSaltArr[2] },
                ]},
                payment: []
            }, seeds[2])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
    })
    it('Vote reveal 2 NO', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[i] },
                    { type:"string", value: tcrSaltArr[i] },
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length-1; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Check results', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"checkResults",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
})

describe('TCR Test 3/3 NO => NO', () => {
    let tcrCommits = ["7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM", "7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM"]
    let tcrReveals = ["0", "0", "0"]
    let tcrSaltArr = ["00009", "00009", "00009"]
    let itemId = "tcr_item_id_" + Math.random()

    it('Add new item from whitelisted user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"addItem",
                args:[
                    { type:"string", value: itemId},
                    { type:"integer", value: 3},
                    { type:"integer", value: 5},
                    { type:"integer", value: 7},
                    { type:"string", value: itemData}
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
        console.log('tcr-item-id: ' + itemId);
    })
    it('Vote commits 3 NO and 0 YES', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteCommit",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrCommits[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Vote reveal 3 NO', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[i] },
                    { type:"string", value: tcrSaltArr[i] },
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Check results', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"checkResults",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
})

describe('TCR Test 3/3 YES => YES', () => {
    let tcrCommits = ["4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx", "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx", "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx"]
    let tcrReveals = ["1", "1", "1"]
    let tcrSaltArr = ["00009", "00009", "00009"]
    let itemId = "tcr_item_id_" + Math.random()

    it('Add new item from whitelisted user', async function(){
        let ts = invokeScript({
            dApp: dappAddress,
            call:{
                function:"addItem",
                args:[
                    { type:"string", value: itemId},
                    { type:"integer", value: 3},
                    { type:"integer", value: 5},
                    { type:"integer", value: 7},
                    { type:"string", value: itemData}
                ]},
                payment: []
            }, seeds[1])
        let tx = await broadcast(ts)
        await waitForTx(tx.id)
        console.log('tcr-item-id: ' + itemId);
    })
    it('Vote commits 3 YES and 0 NO', async function(){
        this.timeout(30000);
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteCommit",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrCommits[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Vote reveal 3 YES', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"voteReveal",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: tcrReveals[i] },
                    { type:"string", value: tcrSaltArr[i] },
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
    it('Check results', async function(){
        let txs = seeds.map(function(x, i){
            return invokeScript({
            dApp: dappAddress,
            call:{
                function:"checkResults",
                args:[
                    { type:"string", value: itemId },
                    { type:"string", value: addresses[i] }
                ]},
                payment: []
            }, x)
        })
        var lastTx = undefined
        for (i = 0; i < txs.length; i++) {
            let tx = await broadcast(txs[i])
            lastTx = tx
        }
        await waitForTx(lastTx.id)
    })
})
