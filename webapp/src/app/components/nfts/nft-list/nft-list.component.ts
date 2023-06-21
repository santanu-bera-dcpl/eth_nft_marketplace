import { Component, OnInit} from '@angular/core';
import { environment } from 'src/environments/environment';
import { NftApiService } from '../../../services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NFT_STATUS } from "../../../constant";
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

  constructor(
    private nftApiService: NftApiService,
    private toastr: ToastrService,
    private _router: Router,
    private _lightbox: Lightbox
  ) { 
    this.blockchain = new Blockchain();
  }

  ngOnInit(): void {
    this.getNFTList(this.current_page);
    this.getAccountAddress();
    this.image_path = environment.NFT_IMAGE_PATH;
    this.thumbnail_path = environment.NFT_THUMBNAIL_PATH;
  }
  getNFTList(current_page: number){
    this.nftApiService.list(current_page, this.items_per_page).then(response => {
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
      this.getNFTList(this.current_page);
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
    this.getNFTList(this.current_page);
  }
  goNext(){
    this.current_page = this.current_page + 1;
    this.getNFTList(this.current_page);
  }
  goToPage(pageItem: any){
    this.current_page = Number(pageItem);
    this.getNFTList(this.current_page);
  }
  async getAccountAddress(){
    this.account = await this.blockchain.getAccountAddress();
  }
  async mintNFT(){
    this.minting = true;
    this.minting_button_disabled = true;
    let contract = await this.blockchain.getContractInstance(CryptoBoys);

    if(!contract){
      this.minting = false;
      this.minting_button_disabled = false;
      this.toastr.error('Contract not found !');
    }

    // Get NFT Details --
    let name: string = this.selected_nft.title;
    let tokenURI: string = environment.NFT_TOKEN_URL + this.selected_nft.internalId;
    let price: number = this.selected_nft.price;
    contract.methods.mintCryptoBoy(name, tokenURI, price)
      .send({ from: this.account })
      .on("confirmation", () => {
      alert("Minted");
    });
    // return;
    // let formData = new FormData();
    // formData.append("id", this.selected_nft.internalId);
    // this.nftApiService.mint(formData).then(response => {
    //   this.minting = false;
    //   this.minting_button_disabled = false;
    //   this.toastr.success('NFT has been minted successfully!');     
    // }).catch(error => {
    //   console.log(error);
    //   this.minting = false;
    //   this.minting_button_disabled = false;
    //   this.toastr.error('Something went wrong while minting NFT!');
    // });
  }
}