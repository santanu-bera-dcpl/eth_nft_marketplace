import mongoose from "mongoose";

import {
  NFT_STATUS
} from "../const.js";

let nftSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
        type: Number,
        required: true
    },
    description: {
      type: String,
    },
    internalId: {
      type: String,
      unique: true,
      required: true,
    },
    files: {
      type: Object
    },
    status: {
      type: String,
      default: NFT_STATUS.DRAFTED
    },
    minted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
const NFTModel = mongoose.model("nft", nftSchema, "nfts");
export default NFTModel;
