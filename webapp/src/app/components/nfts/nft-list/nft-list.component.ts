import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NftApiService } from '../../../services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NftListComponent implements OnInit {

  nftList: any[] = [];
  nft_details_modal_open: boolean = false;
  selected_nft: any;
  image_path: string = "";

  constructor(
    private nftApiService: NftApiService,
    private toastr: ToastrService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.getNFTList();
    this.image_path = environment.NFT_IMAGE_PATH;
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
      this.getNFTList();
    }).catch(error => {
      console.log(error);
      this.toastr.error('Something went wrong while deleting NFT!');
    });
  }
  goToEditNFT(){
    this._router.navigateByUrl('/nft/create-nft/' + this.selected_nft.internalId);
  }
}
