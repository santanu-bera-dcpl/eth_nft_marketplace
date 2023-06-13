import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import {
    PROJECT_DIR,
    NFT_STATUS
} from "../const.js";

// Models --
import NFTModel from "../models/nft.js";

export const create = async (req, res) => {
    try {
        let internalId = req.body.id;
        let title = req.body.title;
        let price = req.body.price;
        let previous_files = req.body.previous_files;

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

        let nft;
        let files = [];
        if(req.files.length > 0){
            req.files.forEach(file => {
                files.push({
                    "name": file.originalname,
                    "type": "image"
                });
            });
        }
        if(internalId){
            previous_files = JSON.parse(previous_files);
            if(previous_files && previous_files.length > 0){
                previous_files.forEach((item)=>{
                    files.push(item);
                });
            }
            // Delete pictures which are deleted in frontend --
            nft = await NFTModel.findOne({ internalId: internalId });
            if(!nft){
                throw Error("NFT not found with Internal ID: " + internalId);
            }
            nft.files.forEach((previousFile)=>{
                let match = false;
                for(let i=0; i<files.length; i++){
                    if(files[i].name === previousFile.name){
                        match = true;
                        break;
                    }
                }
                if(!match){
                    // remove previous image from folder --
                    let image_path = path.join(PROJECT_DIR + "/static/images/nfts/" + previousFile.name);
                    if (fs.existsSync(image_path)) {
                        console.log("Deleting Image : " + image_path);
                        fs.unlink(image_path, (err) => {
                            if (err) throw Error("Error while deleting previous file !");
                            console.log("File deleted successfully !");
                        });
                    }
                }
            });
            // Update NFT --
            await NFTModel.findOneAndUpdate({
               internalId: internalId 
            },{
                title: title,
                price: price,
                description: "",
                files: files
            });

            nft = await NFTModel.findOne({internalId: internalId});
        }else{
            nft = await NFTModel.create({
                title: title,
                price: price,
                description: "",
                internalId: v4(),
                files: files,
                status: NFT_STATUS.DRAFTED
            });
        }

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

        let totalNFTs = await NFTModel.countDocuments(condition);
        return res.status(200).json({has_error: false, nfts: allNfts, totalNFTs: totalNFTs});
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
		return res.status(400).json({has_error: true, message: err.message});
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

export const mint = async (req, res) => {
    try { 
        return res.status(200).json({has_error: false, message: "NFT successfully minted!"});
    }catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}