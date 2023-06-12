import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Observable, of} from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NftApiService } from '../../../services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NFT_STATUS } from "../../../constant";
import { Lightbox } from 'ngx-lightbox';

interface IServerResponse {
  items: string[];
  total: number;
}

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NftListComponent implements OnInit {

  nftList: any[] = [];
  asyncNftList: Observable<string[]>;
  nft_details_modal_open: boolean = false;
  selected_nft: any;
  image_path: string = "";
  loading: boolean = false;
  items_per_page: number = 10;
  current_page: number = 1;
  total_items: number = 200;

  constructor(
    private nftApiService: NftApiService,
    private toastr: ToastrService,
    private _router: Router,
    private _lightbox: Lightbox
  ) { }

  ngOnInit(): void {
    this.getNFTList(this.current_page);
    this.image_path = environment.NFT_IMAGE_PATH;
  }

  getNFTList(current_page: number){
    this.nftApiService.list(current_page, this.items_per_page).then(response => {
      this.nftList = response.data.nfts;
      this.total_items = response.data.totalNFTs;
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
    console.log(albums);
    this._lightbox.open(albums, index);
  }
  getPage($event: any){
    console.log($event);
  }
}
