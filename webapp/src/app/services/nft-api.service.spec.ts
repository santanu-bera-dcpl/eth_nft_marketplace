import { TestBed } from '@angular/core/testing';

import { NftApiService } from './nft-api.service';

describe('NftApiService', () => {
  let service: NftApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NftApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
