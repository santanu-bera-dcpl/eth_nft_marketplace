import { Component, OnInit} from '@angular/core';
import { Blockchain } from 'src/blockchain';
import CryptoBoys from 'src/abis/CryptoBoys.json';

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
  }

  account: string|null = '';
  account_balance: any = 0;
  metamaskConnected: boolean = false;
  contractDeployed: boolean = false;
  network_id: string;
  contract_address: string|null;

  async ngOnInit(): Promise<void> {
    this.blockchain.connectToMetamask();
    this.metamaskConnected = true;
    await this.getAccountAddress();
    await this.fetchBalance();
    await this.getNetworkId();
    this.getContractAddress();
    await this.hasContractDeployed();
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
  async getNetworkId(){
    this.network_id = await this.blockchain.getNetworkID();
  }
  async hasContractDeployed(){
    let hasDeployed = await this.blockchain.hasContractDeployed(this.network_id, CryptoBoys);
    if(hasDeployed){
      this.contractDeployed = true;
    }else{
      this.contractDeployed = false;
    }
  }
  getContractAddress(){
    this.contract_address = this.blockchain.getContractAddress(this.network_id, CryptoBoys);
  }
}
