import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateNftComponent } from './components/nfts/create-nft/create-nft.component';
import { NftListComponent } from './components/nfts/nft-list/nft-list.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateNftComponent,
    NftListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
