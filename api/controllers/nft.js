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
        let mintedBy = req.body.mintedBy;
        let previous_files = req.body.previous_files; 

        let thumbnailImageName = "";
        let thumbnail = (req.files.thumbnail && req.files.thumbnail.length > 0) ? req.files.thumbnail[0] : null;
        let uploadedNFTs = req.files.nfts;

        let has_error = false;
        let error_message = "";

        if(!title){
            has_error = true;
            error_message = "Please provide title!";
        }
        if(!price){
            has_error = true;
            error_message = "Please provide price!";
        }
        if(!mintedBy){
            has_error = true;
            error_message = "Please provide address of creator!";
        }
        if(has_error){
            return res.status(400).json({has_error: true, message: error_message});
        }

        let nft;
        let files = [];
        if(uploadedNFTs && uploadedNFTs.length > 0){
            uploadedNFTs.forEach(file => {
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
            
            // Delete thumbnail Image if there is uploaded thumbnail--
            if(nft.thumbnail && thumbnail && nft.thumbnail !== thumbnail.originalname){
                // remove previous thumb image from folder --
                let image_path = path.join(PROJECT_DIR + "/static/images/thumbnails/" + nft.thumbnail);
                if (fs.existsSync(image_path)) {
                    console.log("Deleting Image : " + image_path);
                    fs.unlink(image_path, (err) => {
                        if (err) throw Error("Error while deleting previous file !");
                        console.log("File deleted successfully !");
                    });
                }
                thumbnailImageName = thumbnail.originalname;
            }else if(thumbnail){
                thumbnailImageName = thumbnail.originalname;
            }else{
                thumbnailImageName = nft.thumbnail;
            }

            // Update NFT --
            await NFTModel.findOneAndUpdate({
               internalId: internalId 
            },{
                title: title,
                price: price,
                thumbnail: thumbnailImageName,
                description: "",
                files: files,
                mintedBy: mintedBy
            });

            nft = await NFTModel.findOne({internalId: internalId});
        }else{
            if(thumbnail){
                thumbnailImageName = thumbnail.originalname;
            }else{
                return res.status(200).json({has_error: true, message: "Please upload thumbnail image!"});
            }

            nft = await NFTModel.create({
                title: title,
                price: price,
                description: "",
                thumbnail: thumbnailImageName,
                internalId: v4(),
                files: files,
                status: NFT_STATUS.DRAFTED,
                mintedBy: mintedBy
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
        if(!req.query.account){
            return res.status(400).json({has_error: true, message: "Address not found!"});
        }
        let condition = {
            'status': {$ne : NFT_STATUS.TRASHED}
        };
        condition.mintedBy = req.query.account;
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
        let internalId = req.body.internalId;
        let tokenId = req.body.tokenId;
        let accountAddress = req.body.accountAddress;
        let tokenURI = req.body.tokenURI;

        if(!internalId){
            return res.status(400).json({has_error: true, message: "Please provide nft ID!"});
        }
        if(!tokenId){
            return res.status(400).json({has_error: true, message: "Please provide token ID!"});
        }
        if(!accountAddress){
            return res.status(400).json({has_error: true, message: "Please provide account address!"});
        }
        if(!tokenURI){
            return res.status(400).json({has_error: true, message: "Please provide token URL !"});
        }

        // Update NFT --
        await NFTModel.findOneAndUpdate({
            internalId: internalId 
         },{
            tokenId: tokenId,
            currentOwnerAddress: accountAddress,
            status: NFT_STATUS.PUBLISHED,
            minted: true,
            tokenURI: tokenURI
        });

        let nft = await NFTModel.findOne({internalId: internalId});

        return res.status(200).json({has_error: false, message: "NFT updated!", nft: nft});
    }catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const public_list = async (req, res) => {
    try {
        let condition = {
            'status': NFT_STATUS.PUBLISHED,
            'minted': true
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

export const completePurchase = async (req, res) => {
    try {
        let internalId = req.body.internalId;
        let accountAddress = req.body.accountAddress;

        if(!internalId){
            return res.status(400).json({has_error: true, message: "Please provide nft ID!"});
        }
        if(!accountAddress){
            return res.status(400).json({has_error: true, message: "Please provide account address!"});
        }

        // Update NFT --
        await NFTModel.findOneAndUpdate({
            internalId: internalId 
         },{
            status: NFT_STATUS.UNPUBLISHED,
            currentOwnerAddress: accountAddress
        });

        // Create a Order --
        // Store current exchange rate --

        let nft = await NFTModel.findOne({internalId: internalId});

        return res.status(200).json({has_error: false, message: "NFT updated!", nft: nft});
    }catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const updateSaleStatus = async (req, res) => {
    try {
        let internalId = req.body.internalId;
        let saleStatus = req.body.status;

        if(!internalId){
            return res.status(400).json({has_error: true, message: "Please provide nft ID!"});
        }
        if(!saleStatus){
            return res.status(400).json({has_error: true, message: "Please provide status!"});
        }

        let data = {
            forSale: false,
            status: NFT_STATUS.UNPUBLISHED
        };
        if(saleStatus === "true"){
            data.forSale = true;
            delete data.status;
        }

        // Update NFT --
        await NFTModel.findOneAndUpdate({
            internalId: internalId 
        }, data);

        let nft = await NFTModel.findOne({internalId: internalId});

        return res.status(200).json({has_error: false, message: "NFT updated!", nft: nft});
    }catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const updateNFTStatus = async (req, res) => {
    try {
        let internalId = req.body.internalId;
        let nftStatus = req.body.status;

        if(!internalId){
            return res.status(400).json({has_error: true, message: "Please provide nft ID!"});
        }
        if(!nftStatus){
            return res.status(400).json({has_error: true, message: "Please provide status!"});
        }

        let nft = await NFTModel.findOne({internalId: internalId});
        if(!nft){
            return res.status(400).json({has_error: true, message: "NFT not found with the ID: " + internalId});
        }

        if(nft.forSale === true){
            // Change Status --
            let data = {};
            if(nftStatus === 'published'){
                data.status = NFT_STATUS.PUBLISHED;
            }else if(nftStatus === 'unpublished'){
                data.status = NFT_STATUS.UNPUBLISHED;
            }
            // Update NFT --
            await NFTModel.findOneAndUpdate({
                internalId: internalId 
            }, data);

            
        }else{
            // Don't publish the NFT --
            // Change Status --
            let data = {};
            if(nftStatus === 'unpublished'){
                data.status = NFT_STATUS.UNPUBLISHED;
            }
            // Update NFT --
            await NFTModel.findOneAndUpdate({
                internalId: internalId 
            }, data);
        }

        let newNft = await NFTModel.findOne({internalId: internalId});

        return res.status(200).json({has_error: false, message: "NFT updated!", nft: newNft});
    }catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const getMyNFTs = async (req, res) => {
    try {
        let currentOwnerAddress = req.query.address;
        let condition = {
            'currentOwnerAddress': currentOwnerAddress
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