import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NftApiService } from 'src/app/services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Lightbox } from 'ngx-lightbox';
import { Blockchain } from 'src/blockchain';
import CryptoBoys from 'src/abis/CryptoBoys.json';

@Component({
  selector: 'app-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.css']
})
export class NftDetailsComponent {
  image_path: string = "";
  thumbnail_path: string = "";
  nftDetails: any = null;
  exchangeRate: number;
  blockchain: Blockchain;
  purchase_button_is_loading: boolean = false;
  purchase_button_is_disabled: boolean = false;
  account_address: string|null;

  constructor(
    private nftApiService: NftApiService,
    public route: ActivatedRoute,
    private toastr: ToastrService,
    private _lightbox: Lightbox
  ) {
    this.blockchain = new Blockchain(CryptoBoys);
  }

  async ngOnInit(): Promise<void> {
    this.exchangeRate = await this.nftApiService.usdToEthExchangeRate();
    this.account_address = await this.blockchain.getAccountAddress();
    this.image_path = environment.NFT_IMAGE_PATH;
    this.thumbnail_path = environment.NFT_THUMBNAIL_PATH;
    let nft_internal_id = this.route.snapshot.paramMap.get('id');
    if(nft_internal_id){
      this.loadNFTDetails(nft_internal_id);
    }
  }

  loadNFTDetails(nftId: string){
    let formData = {
      'id': nftId
    };
    this.nftApiService.details(formData).then(response => {
      this.nftDetails = response.data.details;
      console.log(this.nftDetails);
    }).catch(error => {
      console.log(error);
      this.toastr.error('Something went wrong while retrieving NFT!');
    });
  }
  openLightbox(index: number){
    let image_path = this.image_path;
    let albums = this.nftDetails.files.map(function(item: any){
      return {
        src: image_path + item.name,
        caption: item.name
      };
    });
    this._lightbox.open(albums, index);
  }
  usdToEth(value: number){
    if(this.exchangeRate){
      return value * this.exchangeRate;
    }else{
      return value;
    }
  }
  async purchaseNFT(){
    let price = this.usdToEth(this.nftDetails.price);
    if(price == this.nftDetails.price){
      this.toastr.error("Unable to retrieve exchange rate !");
      return;
    }
    // Convert price from ETH to wei value
    price = this.blockchain.ethToWei(price);
    this.purchase_button_is_loading = true;
    this.purchase_button_is_disabled = true;
    let buyerAddress: string;
    try{
      buyerAddress = await this.blockchain.buyNFT(this.nftDetails.tokenId, price);  
    }catch(err){
      this.toastr.error('Something went wrong while buying NFT!');
      this.purchase_button_is_loading = false;
      this.purchase_button_is_disabled = false;
      return;
    }
    console.log(buyerAddress);
    // Update the db --
    let formData = new FormData();
    formData.append("accountAddress", buyerAddress);
    formData.append("internalId", this.nftDetails.internalId);
    this.nftApiService.completePurchase(formData).then(response => {
      this.purchase_button_is_loading = false;
      this.purchase_button_is_disabled = false;
      // Update local nft --
      this.nftDetails.currentOwnerAddress = response.data.nft.currentOwnerAddress;
      this.nftDetails.status = response.data.nft.status;

      this.toastr.success('You have successfully purchased this NFT!');
    }).catch(error => {
      console.log(error);
      this.purchase_button_is_loading = false;
      this.purchase_button_is_disabled = false;
      this.toastr.error('Something went wrong while updating NFT!');
    });
  }
}
