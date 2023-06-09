import { Component, OnInit } from '@angular/core';
import { NftApiService } from '../../../services/nft-api.service';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NftListComponent implements OnInit {

  nftList: any[] = [];
  nft_details_modal_open: boolean = false;
  selected_nft: any;

  constructor(
    private nftApiService: NftApiService
  ) { }

  ngOnInit(): void {
    this.getNFTList();
  }

  getNFTList(){
    this.nftApiService.list().then(response => {
      this.nftList = response.data.nfts;
      console.log(this.nftList);
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
}
