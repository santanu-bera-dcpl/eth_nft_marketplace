import express from "express";
const router = express.Router();

// Import controllers --
import {
    create,
    list,
    moveToTrash
} from "../controllers/nft.js";

router.post(
  "/create",
  create
);

router.get(
  "/list",
  list
);

router.post(
  "/move-to-trash",
  moveToTrash
);

export const nftRoutes = router;