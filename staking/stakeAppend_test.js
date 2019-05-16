'use strict'

let CoinNodeObj = require('../conf/coinNodeObj.js')
const pu = require("promisefy-util")
let log = console
let web3Instance = new CoinNodeObj(log, 'wanipc');
let web3 = web3Instance.getClient()
const assert = require('assert');
const skb = require('./stakebase.js')


describe('stakeAppend test', async ()=> {
    let newAddr
    before("", async () => {
        await skb.Init()

        newAddr = await skb.newAccount();
        log.info("newAddr: ", newAddr)
        let pubs = await pu.promisefy(web3.personal.showPublicKey, [newAddr, skb.passwd], web3.personal)
        let secpub = pubs[0]
        let g1pub = pubs[1]

        let lockTime = 7
        let feeRate = 79

        // add validator
        let payload = skb.coinContract.stakeIn.getData(secpub, g1pub, lockTime, feeRate)
        let tranValue = 100000
        let txhash = await skb.sendStakeTransaction(tranValue, payload)

        log.info("stakein tx:", txhash)
        let status = await skb.checkTxResult(txhash)
        assert(status == '0x1', "stakein failed")
    })
    it("T0 Normal stakeAppend", async ()=>{
        // append validator
        let tranValue = 93
        let payload = skb.coinContract.stakeAppend.getData(newAddr)
        console.log("payload: ", payload)
        let txhash = await skb.sendStakeTransaction(tranValue, payload)

        log.info("stakein tx:", txhash)
        let status = await skb.checkTxResult(txhash)
        assert(status == '0x1', "stakeAppend failed")
    })
    it("T1 invalidAddr stakeAppend", async ()=>{
        // append validator
        let tranValue = 93
        let payload = skb.coinContract.stakeAppend.getData("0x9988")
        payload = payload.slice(0,16)
        console.log("payload: ", payload)
        try {
            let txhash = await skb.sendStakeTransaction(tranValue, payload)
            log.info("stakeAppend tx:", txhash)
            assert(false, "invalidAddr stakeAppend failed")
        }catch(err){
            console.log(err.toString())
            assert(err.toString().indexOf('Error: stakeAppend verify failed') == 0 , "invalidAddr stakeAppend should failed")
        }
    })
    it("T2 none-exist address stakeAppend", async ()=>{
        // append validator
        let tranValue = 93
        let payload = skb.coinContract.stakeAppend.getData("0x90000000000000000000000000000000000000d2")
        console.log("payload: ", payload)
        let txhash = await skb.sendStakeTransaction(tranValue, payload)

        log.info("stakein tx:", txhash)
        let status = await skb.checkTxResult(txhash)
        assert(status == '0x0', "none-exist address stakeAppend failed")
    })
    after(async ()=>{
        log.info("====end====")
        //process.exit(0)
    })
})