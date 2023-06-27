import { Component, OnInit} from '@angular/core';
import { environment } from 'src/environments/environment';
import { NftApiService } from '../../../services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NFT_STATUS } from "src/app/constant";
import { Lightbox } from 'ngx-lightbox';
import { Blockchain } from 'src/blockchain';
import CryptoBoys from 'src/abis/CryptoBoys.json';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NftListComponent implements OnInit {
  account: string|null = '';
  blockchain: Blockchain;
  nftList: any[] = [];
  nft_details_modal_open: boolean = false;
  selected_nft: any;
  image_path: string = "";
  thumbnail_path: string = "";
  loading: boolean = false;
  items_per_page: number = 3;
  current_page: number = 1;
  total_items: number;
  pagination_items: any[] = [];
  minting: boolean = false;
  minting_button_disabled: boolean = false;
  sell_button_is_loading: boolean = false;
  sell_button_is_disabled: boolean = false;
  publish_button_is_loading: boolean = false;
  publish_button_is_disabled: boolean = false;
  filter_button_is_loading: boolean = false;
  filter_button_is_disabled: boolean = false;
  reset_filter_button_is_loading: boolean = false;
  reset_filter_button_is_disabled: boolean = false;
  nftStatus: any = NFT_STATUS;
  internal_id: string = "";

  constructor(
    private nftApiService: NftApiService,
    private toastr: ToastrService,
    private _router: Router,
    private _lightbox: Lightbox
  ) { 
    this.blockchain = new Blockchain(CryptoBoys);
  }

  async ngOnInit(): Promise<void> {
    await this.getAccountAddress();
    this.getNFTList(this.current_page, {});
    this.image_path = environment.NFT_IMAGE_PATH;
    this.thumbnail_path = environment.NFT_THUMBNAIL_PATH;
  }
  filterNftList(){
    let filter: any = {
      internal_id: this.internal_id
    };
    this.current_page = 1;
    this.getNFTList(this.current_page, filter);
  }
  resetFilterNftList(){
    this.internal_id = "";
    this.current_page = 1;
    this.getNFTList(this.current_page, {});
  }
  getNFTList(current_page: number, filter: any){
    this.nftApiService.list(current_page, this.items_per_page, this.account, filter).then(response => {
      this.nftList = response.data.nfts;
      this.total_items = response.data.totalNFTs;
      this.pagination_items = this.pagination(current_page, Math.ceil(this.total_items/this.items_per_page));
    }).catch(error => {
      console.log(error);
    });
  }
  showDetailsModal(index: number){
    this.selected_nft = this.nftList[index];
    this.nft_details_modal_open = true;
  }
  closeDetailsModal(){
    this.nft_details_modal_open = false;
  }
  deleteNFT(){
    if (confirm("Are you sure you want to delete this NFT?") == true) {
      this.confirmDeleteNFT();
    } else {
      console.log("Closing");
    }
  }
  confirmDeleteNFT(){
    let formData = {
      "id": this.selected_nft.internalId
    };
    this.nftApiService.delete(formData).then(response => {
      this.toastr.success('NFT has been deleted successfully!');
      this.closeDetailsModal();
      this.getNFTList(this.current_page, this.getFilterData());
    }).catch(error => {
      console.log(error);
      this.toastr.error('Something went wrong while deleting NFT!');
    });
  }
  goToEditNFT(){
    this._router.navigateByUrl('/nft/create-nft/' + this.selected_nft.internalId);
  }
  getNFTStatusText(status: string){
    if(status === NFT_STATUS.DRAFTED){
      return "Drafted";
    }else if(status === NFT_STATUS.PUBLISHED){
      return "Published";
    }else if(status === NFT_STATUS.UNPUBLISHED){
      return "Unpublished";
    }else if(status === NFT_STATUS.TRASHED){
      return "Trashed";
    }else{
      return status;
    }
  }
  openLightbox(index: number){
    let image_path = this.image_path;
    let albums = this.selected_nft.files.map(function(item: any){
      return {
        src: image_path + item.name,
        caption: item.name
      };
    });
    this._lightbox.open(albums, index);
  }
  pagination(current: number, last: number, delta = 2) {
    if (last === 1) return [1];
  
    const left = current - delta,
      right = current + delta + 1,
      range = [];
  
    if (last > 1 && current !== 1) {
      range.push("<");
    }
  
    for (let i = 1; i <= last; i++) {
      if (i == 1 || i == last || (i >= left && i < right)) {
        if (i === left && i > 2) {
          range.push("...");
        }
  
        if (i === current) {
          range.push("*" + i + "*");
        } else {
          range.push(i);
        }
  
        if (i === right - 1 && i < last - 1) {
          range.push("...");
        }
      }
    }
  
    if (last > 1 && current !== last) {
      range.push(">");
    }
  
    return range;
  }
  getPageItemText(pageItem: any){
    if(isNaN(pageItem)){
      if(pageItem.indexOf('*') === 0){
        return Number(pageItem.charAt(1));
      }
    }else{
      return pageItem;
    }
  }
  isNumber(value: any) {
    return !isNaN(value);
  }
  goPrev(){
    this.current_page = this.current_page - 1;
    this.getNFTList(this.current_page, this.getFilterData());
  }
  goNext(){
    this.current_page = this.current_page + 1;
    this.getNFTList(this.current_page, this.getFilterData());
  }
  goToPage(pageItem: any){
    this.current_page = Number(pageItem);
    this.getNFTList(this.current_page, this.getFilterData());
  }
  async getAccountAddress(){
    this.account = await this.blockchain.getAccountAddress();
  }
  async mintNFT(){
    this.minting = true;
    this.minting_button_disabled = true;
    let tokenURI: string = environment.NFT_TOKEN_URL + this.selected_nft.internalId;

    // Get NFT Details --
    this.blockchain.mintNFT({
      name: this.selected_nft.title,
      tokenURI: tokenURI,
      price: this.selected_nft.price,
    }).then((result)=>{
      this.minting = false;
      this.minting_button_disabled = false;
      // Update the database --
      let formData = new FormData();
      formData.append("tokenId", result.tokenId);
      formData.append("accountAddress", result.accountAddress);
      formData.append("internalId", this.selected_nft.internalId);
      formData.append("tokenURI", tokenURI);

      this.nftApiService.mint(formData).then(response => {
        this.minting = false;
        this.minting_button_disabled = false;
        // Update local nft --
        this.selected_nft.currentOwnerAddress = response.data.nft.currentOwnerAddress;
        this.selected_nft.status = response.data.nft.status;
        this.selected_nft.tokenId = response.data.nft.tokenId;
        this.selected_nft.minted = response.data.nft.minted;
        this.selected_nft.tokenURI = response.data.nft.tokenURI;

        this.toastr.success('NFT has been minted successfully!');
      }).catch(error => {
        console.log(error);
        this.minting = false;
        this.minting_button_disabled = false;
        this.toastr.error('Error while saving minted data!');
      });
    }).catch((err)=>{
      this.minting = false;
      this.minting_button_disabled = false;
      this.toastr.error('Error while minting NFT!');
      console.log(err);
    })
  }
  async toggleForSale(){
    this.sell_button_is_disabled = true;
    this.sell_button_is_loading = true;
    try{
      let newNFTData = await this.blockchain.toggleForSale(this.selected_nft.tokenId);
      if(newNFTData && newNFTData.tokenId){
        // Update database --
        let formData = new FormData();
        let currentStatus = "false";
        if(newNFTData.forSale === true){
          currentStatus = "true";
        }
        formData.append("internalId", this.selected_nft.internalId);
        formData.append("status", currentStatus);
        this.nftApiService.updateSaleStatus(formData).then(response => {
          this.sell_button_is_disabled = false;
          this.sell_button_is_loading = false;
          if(response.data.nft.forSale){
            this.selected_nft.forSale = true;
            this.selected_nft.status = response.data.nft.status;
            this.toastr.success('Sale has been turned on successfully !');
          }else{
            this.selected_nft.forSale = false;
            this.selected_nft.status = response.data.nft.status;
            this.toastr.success('Sale has been turned off successfully !');
          }
        }).catch(error => {
          console.log(error);
          this.sell_button_is_disabled = false;
          this.sell_button_is_loading = false;
          this.toastr.error('Something went wrong while updating sale status !');
        });
      }
    }catch(error){
      this.sell_button_is_disabled = false;
      this.sell_button_is_loading = false;
      this.toastr.error('Something went wrong while turning off sell !');
    }
  }
  async updateNFTStatus(status: string){
    // Update database --
    let formData = new FormData();
    formData.append("status", status);
    formData.append("internalId", this.selected_nft.internalId);

    this.publish_button_is_disabled = true;
    this.publish_button_is_loading = true;
    
    this.nftApiService.updateNFTStatus(formData).then(response => {
      this.publish_button_is_disabled = false;
      this.publish_button_is_loading = false;
      this.selected_nft.status = response.data.nft.status;
      if(response.data.nft.status === 'published'){
        this.toastr.success('NFT has been published successfully!');
      }else if(response.data.nft.status === 'published'){
        this.toastr.success('NFT has been unpublished successfully!');
      }
    }).catch(error => {
      console.log(error);
      this.publish_button_is_disabled = false;
      this.publish_button_is_loading = false;
      this.toastr.error('Something went wrong while updating NFT status !');
    });
  }
  getFilterData(){
    let filter: any = {};
    if(this.internal_id){
      filter.internal_id = this.internal_id;
    }
    return filter;
  }
}