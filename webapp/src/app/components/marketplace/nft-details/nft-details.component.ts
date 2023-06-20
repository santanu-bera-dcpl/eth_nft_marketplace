import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NftApiService } from 'src/app/services/nft-api.service';
import { ToastrService } from 'ngx-toastr';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.css']
})
export class NftDetailsComponent {
  image_path: string = "";
  thumbnail_path: string = "";
  nftDetails: any = null;

  constructor(
    private nftApiService: NftApiService,
    public route: ActivatedRoute,
    private toastr: ToastrService,
    private _lightbox: Lightbox
  ) { }

  ngOnInit(): void {
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
  purchaseNFT(){
    alert("Implementing...");
  }
}
