import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateNftComponent } from './components/nfts/create-nft/create-nft.component';
import { NftListComponent } from './components/nfts/nft-list/nft-list.component';

const routes: Routes = [
  { path: 'nft/create-nft', component: CreateNftComponent },
  { path: 'nft/create-nft/:id', component: CreateNftComponent },
  { path: 'nft/list', component: NftListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
