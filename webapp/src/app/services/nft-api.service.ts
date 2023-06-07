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
}