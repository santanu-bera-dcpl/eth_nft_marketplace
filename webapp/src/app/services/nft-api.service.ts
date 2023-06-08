import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NftApiService {
  constructor() { }

  list() {
    let url = environment.API_ENDPOINT + "nft/list";
    return axios.get(url);
  }

  create(formData: FormData) {
    let url = environment.API_ENDPOINT + "nft/create";

    return axios({
      method: "post",
      url: url,
      data: formData,
      headers: { "Content-Type": `multipart/form-data` },
    });
  }
}