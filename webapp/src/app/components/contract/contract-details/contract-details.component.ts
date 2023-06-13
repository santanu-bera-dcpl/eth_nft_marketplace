import { Component, OnInit} from '@angular/core';
import Web3 from "web3";

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.css']
})
export class ContractDetailsComponent implements OnInit{
  constructor(
  ) { }

  account: string = '';
  account_balance: any = 0;
  metamaskConnected: boolean = false;

  async ngOnInit(): Promise<void> {
    this.loadWeb3();
    await this.connectToMetamask();
    await this.getAccounts();
    await this.fetchBalance();
  }
  async fetchBalance(){
    let accountBalance = await window.web3.eth.getBalance(this.account);
    accountBalance = window.web3.utils.fromWei(accountBalance, "Ether");
    this.account_balance = (Math.round(accountBalance * 10000) / 10000).toFixed(4);
  }
  async connectToMetamask(){
    await window.ethereum.enable();
    this.metamaskConnected = true;
  }
  async getAccounts(){
    let accounts = await window.web3.eth.getAccounts();
    if(accounts.length){
      this.account = accounts[0];
    }
  }
  loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };
}
