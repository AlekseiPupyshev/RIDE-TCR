// https://github.com/wavesplatform/waves-transactions/blob/master/test/integration.test.ts
// https://github.com/wavesplatform/waves-transactions/blob/master/src/nodeInteraction.ts
// https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let defaultTimeout = 10*1000

const seedWithWaves = "scrap lesson remove sample fork catalog juice language twist sound side oppose"
const dappAddress = address(seedWithWaves) //3MtpzbrmeaTCVKkhUGcgZ2nHYPSYUbSfp5A

let newItemFee = 500000000/100
let voteFee = (150000000/100)

let amountCreator = 4*(newItemFee + voteFee*2 + 100000000/10)
const nonce = 199420

let itemId = "1" + "xxx" + Math.random()
// let itemId = "1xxx0.669258105762421"

const user1Seed = "user1 " + nonce + seedWithWaves + itemId
const user1Address = address(user1Seed)

const user2Seed = "user2 " + nonce + seedWithWaves + itemId
const user2Address = address(user2Seed)

const user3Seed = "user3 " + nonce + seedWithWaves + itemId
const user3Address = address(user3Seed)

const user4Seed = "user4 " + nonce + seedWithWaves + itemId
const user4Address = address(user4Seed)



describe('Token Curated Registries test', () => {
    it('fund users accounts', async function(){
        await broadcast(transfer({amount: amountCreator, recipient: user1Address, fee: 500000}, seedWithWaves))
        await broadcast(transfer({amount: amountCreator, recipient: user2Address, fee: 500000}, seedWithWaves))
        await broadcast(transfer({amount: amountCreator, recipient: user3Address, fee: 500000}, seedWithWaves))
        await broadcast(transfer({amount: amountCreator, recipient: user4Address, fee: 500000}, seedWithWaves))
        await timeout(defaultTimeout);
    })
    it('deposit funds to the dApp', async function(){
        let params = {
            dappAddress: dappAddress,
            call: {
                function: 'deposit',
                args: []
            },
            payment: [{ amount: amountCreator/4, asset:null }]
        }
        await broadcast(invokeScript(params, user1Seed))
        await broadcast(invokeScript(params, user2Seed))
        await broadcast(invokeScript(params, user3Seed))
        await broadcast(invokeScript(params, user4Seed))
        await timeout(defaultTimeout);
    })
    it('create an item', async function(){
        let params = {
            dappAddress: dappAddress,
            call: {
                function: 'addItem',
                args: [{type: "string", value: itemId}]
            },
            payment: []
        }
        await broadcast(invokeScript(params, user1Seed))
        await timeout(defaultTimeout);
    })
    it('vote: commit for an item', async function(){
        let lambda = (commit) => {
            return {
                dappAddress: dappAddress,
                call: {
                    function: 'voteCommit',
                    args: [{type: "string", value: itemId}, {type: "string", value: commit}]
                },
                payment: []
            }
        }
        let hash1 = "7EQaF3MgUEBZ8ehXSQnADy3ugh1Xvb8fQDCfpiZhHstM"
        let hash2 = "ELJFwQv8AVwQ2dYKUnS5w3YvxrecBpRLBVMZxyPqszkb"
        let hash3 = "4uGYBzX16tJqWe5L364CKgrecGhh2BzMMddJPBbB1AEx"
        await broadcast(invokeScript(lambda(hash1), user2Seed))
        await broadcast(invokeScript(lambda(hash2), user3Seed))
        await broadcast(invokeScript(lambda(hash3), user4Seed))
        await timeout(defaultTimeout);
    })
    it('vote: reveal for a commit', async function(){
        let lambda = (x, salt) => {
            return {
                dappAddress: dappAddress,
                call: {
                    function: 'voteReveal',
                    args: [{type: "string", value: itemId}, {type: "string", value: x}, {type: "string", value: salt}]
                },
                payment: []
            }
        }
        let salt1 = "00009"
        let salt2 = "00008"
        let salt3 = "00009"
        let vote1 = "0"
        let vote2 = "1"
        let vote3 = "1"
        await broadcast(invokeScript(lambda(vote1, salt1), user2Seed))
        await timeout(defaultTimeout/3);
        await broadcast(invokeScript(lambda(vote2, salt2), user3Seed))
        await timeout(defaultTimeout/3);
        await broadcast(invokeScript(lambda(vote3, salt3), user4Seed))
        await timeout(defaultTimeout/2);
    })
    it('check results', async function(){
        let lambda = (address) => {
            return {
                dappAddress: dappAddress,
                call: {
                    function: 'checkResults',
                    args: [{type: "string", value: itemId}, {type: "string", value: address}]
                },
                payment: []
            }
        }
        await broadcast(invokeScript(lambda(user2Address), user1Seed))
        await broadcast(invokeScript(lambda(user3Address), user1Seed))
        await broadcast(invokeScript(lambda(user4Address), user1Seed))
        await timeout(defaultTimeout);
    })
    it('withdraw deposits', async function(){

        let lambda = (amount) => {
            return {
                dappAddress: dappAddress,
                call: {
                    function: 'withdraw',
                    args: [{type: "integer", value: amount}]
                },
                payment: []
            }
        }
        await broadcast(invokeScript(lambda(10), user2Seed))
        await broadcast(invokeScript(lambda(voteFee + newItemFee/2), user3Seed))
        await broadcast(invokeScript(lambda(voteFee + newItemFee/2), user4Seed))
        await timeout(defaultTimeout);
    })
})