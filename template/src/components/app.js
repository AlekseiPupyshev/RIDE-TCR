import ReactDOM from "react-dom";
import React from 'react';
import { invokeScript, broadcast, nodeInteraction } from '@waves/waves-transactions'

class App extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    deposit: {
                      seed: '',
                      amount: '',
                      txid: ''
                    },
                    create: {
                      seed: '',
                      time: '',
                      reporter: '',
                      title: '',
                      txid: ''
                    },
                    order: {
                      market: '',
                      seed: '',
                      shares: '',
                      price: '',
                      txid: ''
                    },
                    report: {
                      market: '',
                      seed: '',
                      result: '',
                      txid: ''
                    },
                    claim: {
                      market: '',
                      seed: '',
                      address: '',
                      txid: ''
                    },
                    dapp: {
                        markets: [],
                        height: 0
                    }
                };
                this.baseUri = 'https://testnodes.wavesnodes.com';
                this.wavelet = 100000000;
                this.dappaddress = '3Ms97rtzpjdiXioVRR7WPWy73djiJaCHhKJ';
                this.explorerUrl = "https://wavesexplorer.com/testnet";
                this.fetchBlockchainState = this.fetchBlockchainState.bind(this);
                this.deposit = this.deposit.bind(this);
                this.withdraw = this.withdraw.bind(this);
                this.updateValue = this.updateValue.bind(this);
                this.setOrder = this.setOrder.bind(this);
                this.sendResult = this.sendResult.bind(this);
                this.createMarket = this.createMarket.bind(this);
                this.claim = this.claim.bind(this);
            }
            componentDidMount() {
                window.setInterval(this.fetchBlockchainState, 30000);
            }
            updateValue(scope, key, value) {
              const newState = this.state[scope];
              newState[key] = value;
              this.setState(
                      {
                        [scope]: newState
                      }
                );
            }
            fetchBlockchainState(){
                nodeInteraction.currentHeight(this.baseUri).then((h) => {
                    window.wavesCurrentH = h;
                });
                nodeInteraction.accountData(this.dappaddress, this.baseUri).then((v) => {
                    window.dAppData = v;
                    if (v) {
                        window.dAppDataKeys = Object.keys(v);
                    }
                });

                let keys = window.dAppDataKeys;
                let titles = keys ? keys.filter((x) => {return x.endsWith("_title")}) : [];

                let kTitle = "_title";
                let kEndBlock = "_lastblock";

                let keySplitter = (x, k) => {return x.split(k)[0]};
                let mapper = function(x) {
                    let ans = {key: '', title: '', time: 0};
                    try {
                        ans.key = keySplitter(x, kTitle);
                        ans.title = window.dAppData[x].value;
                        ans.time = window.dAppData[keySplitter(x, kTitle) + kEndBlock].value
                    }
                    catch (e) {
                        console.log(e);
                    } finally {

                    }
                    return ans;
                };
                let markets = titles.map(mapper).filter((x) => {return !!x.key});

                window.dAppMarkets = markets;
                this.updateValue("dapp", "markets", markets);
                this.updateValue("dapp", "height", window.wavesCurrentH);
                console.log(this.state.dapp);
            }
            deposit(){
              if (window.confirm("Are you sure you wish to deposit?")) {
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: "deposit",
                          args:[]
                      },
                      payment: [ {amount: this.state.deposit.amount*this.wavelet, asset:null } ],
                      chainId: 84
                  };
                  console.log(this.state.deposit);
                  console.log(params);
                  let tx = invokeScript(params, this.state.deposit.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("deposit", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("deposit", "txid", '') });
              }
            }
            withdraw(){
              if (window.confirm("Are you sure you wish to withdraw?")) {
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: "withdraw",
                          args:[
                              { type:"integer", value: this.state.deposit.amount*this.wavelet },
                          ]
                      },
                      payment: [],
                      chainId: 84
                  };
                  console.log(this.state.deposit);
                  console.log(params);
                  let tx = invokeScript(params, this.state.deposit.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("deposit", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("deposit", "txid", '') });
              }
            }
            createMarket() {
                if (window.confirm("Are you sure you wish to create new Market?")) {
                    //title: String, description: String, oracle: String, interval: Int
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: "createMarket",
                          args:[
                              { type:"string", value: this.state.create.title },
                              { type:"string", value: "Default: https://twitter.com/wavesplatform" },
                              { type:"string", value: this.state.create.reporter },
                              { type:"integer", value: this.state.create.time }
                          ]
                      },
                      payment: [],
                      chainId: 84
                  };
                  console.log(this.state.create);
                  console.log(params);
                  let tx = invokeScript(params, this.state.create.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("create", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("create", "txid", '') });
              }
            }
            setOrder(type) {
                let func =  type == "sell" ? "setOrderLimitSell" : "setOrderMarketBuy";
                if (window.confirm("Are you sure you wish to set new order?")) {
                    //marketId: String, price: Int, volume: Int
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: func,
                          args:[
                              { type:"string", value: this.state.order.market },
                              { type:"integer", value: this.state.order.price },
                              { type:"integer", value: this.state.order.shares }
                          ]
                      },
                      payment: [],
                      chainId: 84
                  };
                  console.log(this.state.order);
                  console.log(params);
                  let tx = invokeScript(params, this.state.order.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("order", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("order", "txid", '') });
              }
            }
            sendResult(result) {
                if (window.confirm("Are you sure you wish to send report?")) {
                    //marketId: String, result: String
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: "reportMarket",
                          args:[
                              { type:"string", value: this.state.report.market },
                              { type:"string", value: result }
                          ]
                      },
                      payment: [],
                      chainId: 84
                  };
                  console.log(this.state.report);
                  console.log(params);
                  let tx = invokeScript(params, this.state.report.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("report", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("report", "txid", '') });
              }
            }
            claim(result) {
                let func =  result == "yes" ? "claimFundsResultYes" : "claimFundsResultNo";
                if (window.confirm("Are you sure you wish to claim funds?")) {
                    //marketId: String, account: String
                  const params = {
                      dappAddress: this.dappaddress,
                      call: {
                          function: func,
                          args:[
                              { type:"string", value: this.state.claim.market },
                              { type:"string", value: this.state.claim.address }
                          ]
                      },
                      payment: [],
                      chainId: 84
                  };
                  console.log(this.state.claim);
                  console.log(params);
                  let tx = invokeScript(params, this.state.claim.seed);
                  let res = broadcast(tx, this.baseUri);
                  res.then((v) => this.updateValue("claim", "txid", tx.id),
                      (e) => { console.log(e); this.updateValue("claim", "txid", '') });
              }
            }
            render() {
                return (
                    <div className="container">
                      <div className="deposit form-group">
                        <label>[User] Deposit or Withdraw</label>
                        <input className="form-control" type="text" placeholder="Seed phrase" onChange={(e) => this.updateValue("deposit", "seed", e.target.value)}/>
                        <small className="form-text text-muted">It is a demo in Waves testnet. Please keep your seed always carefully</small>
                        <input className="form-control" type="number" placeholder="WAVES - Amount" onChange={(e) => this.updateValue("deposit", "amount", e.target.value)}/>
                        <button className="btn btn-outline-info" type="submit" value="Deposit" onClick={this.deposit}>Deposit</button>
                        <button className="btn btn-outline-danger" type="submit" value="Withdraw" onClick={this.withdraw}>Withdraw</button>
                        <br/>
                        <a className="form-text text-muted" target="_blank" href={this.explorerUrl + "/tx/" + this.state.deposit.txid}>Transaction: {this.state.deposit.txid}</a>
                        <br/>
                      </div>
                    <div className="row">
                      <div className="form-group col">
                        <label>[Creator] Create Market</label>
                        <input className="form-control" type="text" placeholder="Seed phrase" onChange={(e) => this.updateValue("create", "seed", e.target.value)}/>
                        <small className="form-text text-muted">It is a demo in Waves testnet. Please keep your seed always carefully</small>
                        <input className="form-control" type="text" placeholder="Market Title" onChange={(e) => this.updateValue("create", "title", e.target.value)}/>
                        <input className="form-control" type="text" placeholder="Reporter Address" onChange={(e) => this.updateValue("create", "reporter", e.target.value)}/>
                        <input className="form-control" type="number" placeholder="Time (blocks)" onChange={(e) => this.updateValue("create", "time", e.target.value)}/>
                        <button className="btn btn-outline-info" type="submit" value="Create" onClick={this.createMarket}>Create New Market</button>
                        <a className="form-text text-muted" target="_blank" href={this.explorerUrl + "/tx/" + this.state.create.txid}>Transaction: {this.state.create.txid}</a>
                      </div>
                      <div className="getfunds form-group col">
                        <label>[User] Set *Limit Sell* or *Buy* Order</label>
                        <input className="form-control" type="text" placeholder="Market Id" onChange={(e) => this.updateValue("order", "market", e.target.value)}/>
                        <input className="form-control" type="text" placeholder="Seed phrase" onChange={(e) => this.updateValue("order", "seed", e.target.value)}/>
                        <small className="form-text text-muted">It is a demo in Waves testnet. Please keep your seed always carefully</small>
                        <input className="form-control" type="number" placeholder="Price [1-100]" onChange={(e) => this.updateValue("order", "price", e.target.value)}/>
                        <input className="form-control" type="number" placeholder="Shares - Amount" onChange={(e) => this.updateValue("order", "shares", e.target.value)}/>
                        <button className="btn btn-outline-danger" type="submit" value="Limit Sell" onClick={(_) => this.setOrder("sell")}>Limit Sell</button>
                        <button className="btn btn-outline-info" type="submit" value="Market Buy" onClick={(_) => this.setOrder("buy")}>Market Buy</button>
                        <a className="form-text text-muted" target="_blank" href={this.explorerUrl + "/tx/" + this.state.order.txid}>Transaction: {this.state.order.txid}</a>
                      </div>
                    </div>
                    <div className="row">
                    <div className="form-group col">
                        <label>[Oracle] Report Market Result</label>
                        <input className="form-control" type="text" placeholder="Market Id" onChange={(e) => this.updateValue("report", "market", e.target.value)}/>
                        <input className="form-control" type="text" placeholder="Seed phrase" onChange={(e) => this.updateValue("report", "seed", e.target.value)}/>
                        <small className="form-text text-muted">It is a demo in Waves testnet. Please keep your seed always carefully</small>
                        <button className="btn btn-outline-info" type="submit" value="Send Report - YES" onClick={(_) => this.sendResult("closed_yes")}>Send Report - YES</button>
                        <button className="btn btn-outline-danger" type="submit" value="Send Report - NO" onClick={(_) => this.sendResult("closed_no")}>Send Report - NO</button>
                        <a className="form-text text-muted" target="_blank" href={this.explorerUrl + "/tx/" + this.state.report.txid}>Transaction: {this.state.report.txid}</a>
                    </div>
                    <div className="form-group col">
                        <label>[User] Claim Funds</label>
                        <input className="form-control" type="text" placeholder="Market Id" onChange={(e) => this.updateValue("claim", "market", e.target.value)}/>
                        <input className="form-control" type="text" placeholder="Seed phrase" onChange={(e) => this.updateValue("claim", "seed", e.target.value)}/>
                        <small className="form-text text-muted">It is a demo in Waves testnet. Please keep your seed always carefully</small>
                        <input className="form-control" type="text" placeholder="User Address" onChange={(e) => this.updateValue("claim", "address", e.target.value)}/>
                        <button className="btn btn-outline-info" type="submit" value="Claim Funds - YES" onClick={(_) => this.claim("yes")}>Claim Funds - YES</button>
                        <button className="btn btn-outline-danger" type="submit" value="Claim Funds - NO" onClick={(_) => this.claim("no")}>Claim Funds - NO</button>
                        <a className="form-text text-muted" target="_blank" href={this.explorerUrl + "/tx/" + this.state.claim.txid}>Transaction: {this.state.claim.txid}</a>
                        <br/>
                    </div>
                    </div>
                        <h1 class="display-5 text-center text-info">Existing Markets</h1>
                        <div className = "itemslist">
                            {this.state.dapp.markets.map((x) => {
                                return (
                                    <ul className="list-group list-group-horizontal-sm">
                                        <li className="list-group-item">{this.state.dapp.height}</li>
                                        <li className="list-group-item">{x.time - this.state.dapp.height}</li>
                                        <li className="list-group-item">{x.time}</li>
                                        <li className="list-group-item">{x.key}</li>
                                        <li className="list-group-item">{x.title}</li>
                                    </ul>
                                )
                                })}
                        </div>
                    </div>
                );
            }
        }

const app = document.getElementById('app');
if(app){
    ReactDOM.render(<App/>, app);
}