import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NftApiService {
  constructor() { }

  list(current_page: number, items_per_page: number) {
    let url = environment.API_ENDPOINT + "nft/list?";
    if(current_page){
      url = url + "pageNum=" + current_page + "&";
    }
    if(items_per_page){
      url = url + "perPage=" + items_per_page;
    }
    const config = {
      method: 'get',
      url: url
    };
    
    return axios(config);
  }

  details(formData: any) {
    let url = environment.API_ENDPOINT + "nft/details/";
    if(formData.id){
      url = url + formData.id;
    }
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

  delete(formData: any) {
    let url = environment.API_ENDPOINT + "nft/move-to-trash";
    return axios({
      method: "post",
      url: url,
      data: formData,
    });
  }

  mint(formData: FormData){
    let url = environment.API_ENDPOINT + "nft/mint";
    return axios({
      method: "post",
      url: url,
      data: formData,
      headers: { "Content-Type": `application/json` },
    });
  }

  public_list(current_page: number, items_per_page: number) {
    let url = environment.API_ENDPOINT + "nft/public_list?";
    if(current_page){
      url = url + "pageNum=" + current_page + "&";
    }
    if(items_per_page){
      url = url + "perPage=" + items_per_page;
    }
    const config = {
      method: 'get',
      url: url
    };
    
    return axios(config);
  }

  usdToEthExchangeRate(): Promise<number>{
    return new Promise((resolve, reject)=>{
      let url = "https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=ETH";
      const config = {
        method: 'get',
        url: url
      };   
      axios(config).then(response => {
        if(response.data && response.data["ETH"]){
          resolve(response.data["ETH"]);
        }
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }
}