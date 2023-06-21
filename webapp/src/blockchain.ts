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
    async getNetworkID(): Promise<string>{
        return await window.web3.eth.net.getId();
    }
    async hasContractDeployed(networkId: string, contractABI: any): Promise<boolean>{
        if(!networkId){
            return false;
        }
        let networks: any = contractABI.networks;
        const networkData: any = networks[networkId];
        if(networkData){
            const contractInstance = new window.web3.eth.Contract(contractABI.abi, networkData.address);
            if (contractInstance){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    async getContractInstance(contractABI: any): Promise<any>{
        let network_id = await this.getNetworkID();
        if(!network_id){
            return null;
        }
        let networks: any = contractABI.networks;
        const networkData: any = networks[network_id];
        if(networkData){
            return new window.web3.eth.Contract(contractABI.abi, networkData.address);
        }else{
            return null;
        }
    }
    getContractAddress(networkId: string, contractABI: any): string|null{
        if(!networkId){
            return null;
        }
        let networks: any = contractABI.networks;
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
    async mintNFT(params: any): Promise<any>{
        let {
            contractABI,
            name,
            tokenURI,
            price
        } = params;
        let contract: any = await this.getContractInstance(contractABI);
        let accountAddress = await this.getAccountAddress();
        let totalTokenMinted: number = await contract.methods.getNumberOfTokensMinted().call();
        return new Promise((resolve, reject)=>{
            try{
                contract.methods.mintCryptoBoy(name, tokenURI, price).send({ from: accountAddress }).on("confirmation", () => {
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
}