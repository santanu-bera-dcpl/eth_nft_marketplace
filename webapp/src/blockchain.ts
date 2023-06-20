import Web3 from "web3";

export class Blockchain{
    constructor(){
        this.loadWeb3();
    }
    async loadWeb3(): Promise<boolean>{
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            return true;
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            return true;
        } else {
            return false;
        }
    }
    async connectToMetamask(){
        await window.ethereum.enable();
    }
    async getAccountAddress(): Promise<string|null>{
        let accounts = await window.web3.eth.getAccounts();
        if(accounts.length){
          return accounts[0];    
        }
        return null;
    }
    async fetchBalance(accountAddress: string|null, toFixed: number = 4): Promise<number>{
        if(accountAddress){
            let accountBalance = await window.web3.eth.getBalance(accountAddress);
            accountBalance = window.web3.utils.fromWei(accountBalance, "Ether");
            return Number((Math.round(accountBalance * 10000) / 10000).toFixed(toFixed));
        }
        return 0;
    }
}