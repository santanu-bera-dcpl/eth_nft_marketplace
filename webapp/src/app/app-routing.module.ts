import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateNftComponent } from './components/nfts/create-nft/create-nft.component';
import { NftListComponent } from './components/nfts/nft-list/nft-list.component';
import { ContractDetailsComponent } from './components/contract/contract-details/contract-details.component';
import { NftListComponent as MarketplaceNftListComponent } from './components/marketplace/nft-list/nft-list.component';

const routes: Routes = [
  { path: 'nft/create-nft', component: CreateNftComponent },
  { path: 'nft/create-nft/:id', component: CreateNftComponent },
  { path: 'nft/list', component: NftListComponent },
  { path: 'contract/details', component: ContractDetailsComponent },
  { path: 'marketplace/nft-list', component: MarketplaceNftListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
