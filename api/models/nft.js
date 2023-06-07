import mongoose from "mongoose";

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
    }
  },
  { timestamps: true }
);
const NFTModel = mongoose.model("nft", nftSchema, "nfts");
export default NFTModel;
