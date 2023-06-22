import { async } from "@angular/core/testing";
import Web3 from "web3";

export class Blockchain{
    contractABI: any;
    contractInstance: any;
    constructor(contractABI: any){
        this.contractABI = contractABI;
        this.__initialize();
    }
    private async __initialize(){
        this.loadWeb3();
        this.contractInstance = await this.getContractInstance();
    }
    loadWeb3(): boolean{
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
    async getNetworkID(): Promise<string>{
        return await window.web3.eth.net.getId();
    }
    async hasContractDeployed(): Promise<boolean>{
        let networkId: string = await this.getNetworkID();
        let networks: any = this.contractABI.networks;
        const networkData: any = networks[networkId];
        if(networkData){
            const contractInstance = new window.web3.eth.Contract(this.contractABI.abi, networkData.address);
            if (contractInstance){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    async getContractInstance(): Promise<any>{
        let networkId: string = await this.getNetworkID();
        let networks: any = this.contractABI.networks;
        const networkData: any = networks[networkId];
        if(networkData){
            return new window.web3.eth.Contract(this.contractABI.abi, networkData.address);
        }else{
            return null;
        }
    }
    async getContractAddress(): Promise<string|null>{
        let networkId: string = await this.getNetworkID();
        let networks: any = this.contractABI.networks;
        const networkData: any = networks[networkId];
        return networkData.address;
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
    async getNumberOfTokensMinted(): Promise<number>{
        return await this.contractInstance.methods.getNumberOfTokensMinted().call();
    }
    async mintNFT(params: any): Promise<any>{
        let {
            name,
            tokenURI,
            price
        } = params;
        let accountAddress = await this.getAccountAddress();
        let totalTokenMinted: number = await this.getNumberOfTokensMinted();
        return new Promise((resolve, reject)=>{
            try{
                this.contractInstance.methods.mintCryptoBoy(name, tokenURI, price).send({ from: accountAddress }).on("confirmation", () => {
                    resolve({
                        'tokenId': Number(totalTokenMinted) + 1,
                        'accountAddress': accountAddress
                    });
                });
            }catch(err){
                reject(null);
            }
        })
    }
    async buyNFT(tokenId: number, price: number): Promise<string>{
        return new Promise(async (resolve, reject)=> {
            try{
                let accountAddress = await this.getAccountAddress();
                this.contractInstance.methods.buyToken(tokenId).send({ from: accountAddress, value: price }).on("confirmation", async () => {
                    // Purchase successful --
                    // Get Owner by tokenID --
                    let currentOwnerAddress = await this.getTokenOwner(tokenId);
                    resolve(currentOwnerAddress);
                });
            }catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
    async getTokenOwner(tokenId: number): Promise<string>{
        return new Promise(async (resolve, reject)=> {
            try{
                let result = await this.contractInstance.methods.getTokenOwner(tokenId).call();
                resolve(result);
            }catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
    async getNFTDetailsByTokenID(tokenId: number){
        return new Promise(async (resolve, reject)=> {
            try{
                let nftDetails = await this.contractInstance.methods.allCryptoBoys(tokenId).call();
                let data = {
                    "currentOwner" : nftDetails.currentOwner,
                    "forSale" : nftDetails.forSale,
                    "mintedBy" : nftDetails.mintedBy,
                    "numberOfTransfers" : nftDetails.numberOfTransfers,
                    "previousOwner" : nftDetails.previousOwner,
                    "price" : nftDetails.price,
                    "tokenId" : nftDetails.tokenId,
                    "tokenName" : nftDetails.tokenName,
                    "tokenURI" : nftDetails.tokenURI
                };
                resolve(data);
            }catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
    async turnOffSell(tokenId: number): Promise<any>{
        return new Promise(async (resolve, reject)=> {
            try{
                let accountAddress = await this.getAccountAddress();
                this.contractInstance.methods.toggleForSale(tokenId).send({ from: accountAddress }).on("confirmation", async () => {
                    // Verify that sell is off --
                    // Get nft data from blockchain --
                    let nftDetails = await this.getNFTDetailsByTokenID(tokenId);
                    console.log(nftDetails);
                    resolve(nftDetails);
                });
            }catch(error){
                console.log(error);
                reject(error);
            }
        });
    }
    ethToWei(value: number){
        if(window.web3){
            return window.web3.utils.toWei((Math.round(value * 1000000) / 1000000).toFixed(8), 'ether');
        }else{
            return null;
        }
    }
}