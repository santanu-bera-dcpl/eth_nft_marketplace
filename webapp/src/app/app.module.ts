import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { LightboxModule } from 'ngx-lightbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateNftComponent } from './components/nfts/create-nft/create-nft.component';
import { NftListComponent } from './components/nfts/nft-list/nft-list.component';
import { NftListComponent as MarketplaceNftListComponent } from './components/marketplace/nft-list/nft-list.component';
import { FormsModule } from '@angular/forms';
import { ContractDetailsComponent } from './components/contract/contract-details/contract-details.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    CreateNftComponent,
    NftListComponent,
    ContractDetailsComponent,
    MarketplaceNftListComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    LightboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
