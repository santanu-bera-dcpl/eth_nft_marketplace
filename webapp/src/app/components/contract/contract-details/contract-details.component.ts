import { Component, OnInit} from '@angular/core';
import Web3 from "web3";
import { Blockchain } from "../../../../blockchain";

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.css']
})
export class ContractDetailsComponent implements OnInit{
  blockchain: Blockchain;
  constructor(
  ) { 
    this.blockchain = new Blockchain();
    this.blockchain.connectToMetamask();
    this.metamaskConnected = true;
  }

  account: string|null = '';
  account_balance: any = 0;
  metamaskConnected: boolean = false;

  async ngOnInit(): Promise<void> {
    await this.getAccountAddress();
    await this.fetchBalance();
  }
  connectToMetamask(){
    this.blockchain.connectToMetamask();
    this.metamaskConnected = true;
  }
  async fetchBalance(){
    this.account_balance = await this.blockchain.fetchBalance(this.account);
  }
  async getAccountAddress(){
    this.account = await this.blockchain.getAccountAddress();
  }
}
