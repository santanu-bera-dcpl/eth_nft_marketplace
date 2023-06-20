import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NftApiService } from 'src/app/services/nft-api.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-nft',
  templateUrl: './create-nft.component.html',
  styleUrls: ['./create-nft.component.css']
})
export class CreateNftComponent implements OnInit {
  button_disabled: boolean = false;
  nft_title: any = "";
  nft_price: any = "";
  selected_files: any = [];
  nftDetails: any = null;
  existingUploadedFiles: any = null;
  image_path: string = "";
  thumbnail_path: string = "";
  thumbnailData: any;
  thumbnailImage: string|ArrayBuffer|null;

  constructor(
    private nftApiService: NftApiService,
    private toastr: ToastrService,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.image_path = environment.NFT_IMAGE_PATH;
    this.thumbnail_path = environment.NFT_THUMBNAIL_PATH;
    let nft_internal_id = this.route.snapshot.paramMap.get('id');
    if(nft_internal_id){
      this.loadNFTDetails(nft_internal_id);
    }
  }

  onSubmit(){
    if(!this.nft_title){
      this.toastr.error('Please provide title of the NFT !');
      return;
    }
    if(!this.nft_price){
      this.toastr.error('Please provide price of the NFT !');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('title', this.nft_title);
    formData.append('price', this.nft_price);
    formData.append('thumbnail', this.thumbnailData);
    this.selected_files.forEach((file: any) => {
      formData.append('nfts', file.originalFile);
    });
    if(this.nftDetails){
      formData.append("id", this.nftDetails.internalId);
      formData.append("previous_files", JSON.stringify(this.existingUploadedFiles));
    }    
    
    this.button_disabled = true;

    this.nftApiService.create(formData).then(response => {
      this.button_disabled = false;
      if(this.nftDetails){
        console.log(response.data.nft);
        this.resetForm(response.data.nft);
        this.toastr.success('NFT has been updated successfully!');
      }else{
        this.resetForm(null);
        this.toastr.success('NFT has been created successfully!');
      }      
    }).catch(error => {
      console.log(error);
      this.button_disabled = false;
      if(this.nftDetails){
        this.toastr.error('Something went wrong while updating NFT!');
      }else{
        this.toastr.error('Something went wrong while creating NFT!');
      } 
    });
  }

  fileChangeEvent(event: any): void {
    let imageData: any = {};
    const files = event.target.files;
    if (files.length === 0)
        return;

    const mimeType = files[0].type;
    imageData.mimeType = mimeType;
    imageData.name = files[0].name;
    imageData.originalFile = files[0];
    if (mimeType.match(/image\/*/) == null) {
        alert("Only images are supported");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => {
      imageData.data = reader.result; 
    }

    this.selected_files = [...this.selected_files, imageData];
  }

  handleThumbnailSelected(event: any): void {
    const files = event.target.files;
    if (files.length === 0)
        return;

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
        alert("Only images are supported");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => {
      this.thumbnailData = files[0];
      this.thumbnailImage = reader.result;
    }
  }

  removeUploadedFile(index: number): void {
    this.selected_files = this.selected_files.filter((item: any, i: number)=>i !== index);
  }

  removeExistingUploadedFile(index: number): void {
    this.existingUploadedFiles = this.existingUploadedFiles.filter((item: any, i: number)=>i !== index);
  }

  resetForm(data: any){
    if(data){
      console.log(data);
      this.nft_title = data.title;
      this.nft_price = data.price;
      this.existingUploadedFiles = data.files;
      this.selected_files = [];
      this.thumbnailData = null;
      this.thumbnailImage = this.thumbnail_path + data.thumbnail;
    }else{
      this.nft_title = "";
      this.nft_price = 0;
      this.existingUploadedFiles = [];
      this.selected_files = [];
      this.thumbnailData = null;
      this.thumbnailImage = null;
    }
  }

  loadNFTDetails(nftId: string){
    let formData = {
      'id': nftId
    };
    this.nftApiService.details(formData).then(response => {
      this.nftDetails = response.data.details;
      this.existingUploadedFiles = [...this.nftDetails.files];
      this.resetForm(this.nftDetails);
    }).catch(error => {
      console.log(error);
      this.toastr.error('Something went wrong while retrieving NFT!');
    });
  }
}

