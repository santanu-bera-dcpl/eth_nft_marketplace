// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_ENDPOINT: 'http://127.0.0.1:5050/',
  NFT_IMAGE_PATH: "http://127.0.0.1:5050/images/nfts/",
  NFT_THUMBNAIL_PATH: "http://127.0.0.1:5050/images/thumbnails/",
  NFT_TOKEN_URL: "http://localhost:4200/marketplace/nft-details/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
