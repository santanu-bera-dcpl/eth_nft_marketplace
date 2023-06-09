import { v4 } from "uuid";

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
                files.push(file.originalname);
            });
        }

        let nft = await NFTModel.create({
            title: title,
            price: price,
            description: "",
            internalId: v4(),
            files: files
        });

        return res.status(200).json({has_error: false, nft: nft});
    } catch (err) {
		console.log(err);
		return res.status(400).json({has_error: true, message: err.message});
	}
}

export const list = async (req, res) => {
    try {
        let condition = {};
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
        return res.status(200).json({article: "Hi..."});
    } catch (err) {
		console.log(err);
		return res.status(400).json({message: err.message});
	}
}