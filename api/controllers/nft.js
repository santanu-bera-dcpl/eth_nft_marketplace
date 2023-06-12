import { v4 } from "uuid";
import {NFT_STATUS} from "../const.js";

// Models --
import NFTModel from "../models/nft.js";

export const create = async (req, res) => {
    try {
        let title = req.body.title;
        let price = req.body.price;

        let has_error = false;
        let error_message = "";

        if(!title){
            has_error = true;
            error_message = "Please provide title!";
        }
        if(!price){
            has_error = false;
            error_message = "Please provide price!";
        }
        if(has_error){
            return res.status(400).json({has_error: true, message: error_message});
        }

        let files = [];
        if(req.files.length > 0){
            req.files.forEach(file => {
                files.push({
                    "name": file.originalname,
                    "type": "image"
                });
            });
        }

        let nft = await NFTModel.create({
            title: title,
            price: price,
            description: "",
            internalId: v4(),
            files: files,
            status: NFT_STATUS.DRAFTED
        });

        return res.status(200).json({has_error: false, nft: nft});
    } catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const list = async (req, res) => {
    try {
        let condition = {
            'status': {$ne : NFT_STATUS.TRASHED}
        };
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
        const page = req.query.pageNum ? parseInt(req.query.pageNum) : 1;
        const skip = (page - 1) * perPage;

        let allNfts = await NFTModel.aggregate([
            {
              $match: condition,
            },
            { $skip: skip },
            { $limit: perPage },
        ]);

        return res.status(200).json({has_error: false, nfts: allNfts});
    } catch (err) {
		console.log(err);
		return res.status(400).json({message: err.message});
	}
}

export const moveToTrash = async (req, res) => {
    try {
        let internal_id = req.body.id;

        let has_error = false;
        let error_message = "";

        if(!internal_id){
            has_error = true;
            error_message = "Please provide ID!";
        }
        if(has_error){
            return res.status(400).json({has_error: true, message: error_message});
        }

        // Check if NFT exists --
        let condition = {"internalId": internal_id, 'status': {$ne : NFT_STATUS.TRASHED}};
        let nft = await NFTModel.findOne(condition);
        if(!nft){
            return res.status(400).json({has_error: true, message: "NFT does not exists !"});
        }

        await NFTModel.findOneAndUpdate(condition, {
            status: NFT_STATUS.TRASHED
        });

        return res.status(200).json({has_error: false, message: "NFT successfully deleted!"});
    } catch (err) {
		console.log(err);
		return res.status(400).json({message: err.message});
	}
}

export const details = async (req, res) => {
    try {
        let internalId = req.params.nftId;

        let has_error = false;
        let error_message = "";

        if(!internalId){
            has_error = false;
            error_message = "Please provide ID!";
        }
        if(has_error){
            return res.status(400).json({has_error: true, message: error_message});
        }

        let nftDetails = await NFTModel.findOne({'internalId': internalId});

        return res.status(200).json({has_error: false, details: nftDetails});
    } catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}