import express from "express";
const router = express.Router();
import multer from "multer";
const upload = multer({ dest: "upload" });

// Import controllers --
import {
    create,
    list,
    moveToTrash
} from "../controllers/nft.js";

router.post(
  "/create",
  upload.single("files"),
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