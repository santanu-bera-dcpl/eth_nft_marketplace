import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NftApiService } from 'src/app/services/nft-api.service';
import { Blockchain } from 'src/blockchain';
import CryptoBoys from 'src/abis/CryptoBoys.json';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NftListComponent {
  nftList: any[] = [];
  items_per_page: number = 2;
  current_page: number = 1;
  total_items: number;
  pagination_items: any[] = [];
  thumbnail_path: string = "";
  blockchain: Blockchain;
  account_address: string|null;

  constructor(
    private nftApiService: NftApiService,
    private _router: Router,
  ) {
    this.blockchain = new Blockchain(CryptoBoys);
  }

  async ngOnInit(): Promise<void> {
    this.thumbnail_path = environment.NFT_THUMBNAIL_PATH;
    this.account_address = await this.blockchain.getAccountAddress();
    this.getNFTList(this.current_page);
  }
  getNFTList(current_page: number){
    let formData = {
      current_page: this.current_page, 
      items_per_page: this.items_per_page,
      account_address: this.account_address
    };
    this.nftApiService.public_list(formData).then(response => {
      this.nftList = response.data.nfts;
      console.log(this.nftList);
      this.total_items = response.data.totalNFTs;
      this.pagination_items = this.pagination(current_page, Math.ceil(this.total_items/this.items_per_page));
    }).catch(error => {
      console.log(error);
    });
  }
  pagination(current: number, last: number, delta = 2) {
    if (last === 1) return [1];
  
    const left = current - delta, right = current + delta + 1, range = [];
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
  goToNFTDetailsPage(nft: any){
    this._router.navigateByUrl('/marketplace/nft-details/' + nft.internalId);
  }
}
