import express from "express";
const router = express.Router();
import multer from "multer";
import {PROJECT_DIR} from "../const.js";

var storage = multer.diskStorage({
  // Where to save
  destination: function (req, file, cb) {
    cb(null, PROJECT_DIR + '/static/images/nfts')
  },
  // File name
  filename: function (req, file, cb) {
    cb(null, file.originalname)  // file.originalname will give the original name of the image which you have saved in your computer system
  }
});
const upload = multer({ storage: storage });

// Import controllers --
import {
    create,
    list,
    moveToTrash,
    details,
    mint
} from "../controllers/nft.js";

router.post(
  "/create",
  upload.array('files[]'),
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

router.get(
  "/details/:nftId",
  details
);

router.post(
  "/mint",
  mint
);

export const nftRoutes = router;