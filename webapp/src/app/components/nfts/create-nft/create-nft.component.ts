import { Component, OnInit } from '@angular/core';
import { NftApiService } from '../../../services/nft-api.service';

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

  constructor(private nftApiService: NftApiService) { }

  ngOnInit(): void {
  }

  onSubmit(){
    let formData: FormData = new FormData();
    formData.append('title', this.nft_title);
    formData.append('price', this.nft_price);
    this.selected_files.forEach((file: any) => {
      formData.append('files[]', file.originalFile);  
    });
    
    console.log(formData);
    // this.button_disabled = true;

    this.nftApiService.create(formData).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
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

  removeUploadedFile(index: number): void {
    this.selected_files = this.selected_files.filter((item: any, i: number)=>i !== index);
  }
}
