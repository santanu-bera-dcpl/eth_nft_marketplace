import { v4 } from "uuid";
// Models --
import NFTModel from "../models/nft.js";

export const create = async (req, res) => {
    try {
        return res.status(200).json({article: "Hi..."});
    } catch (err) {
		console.log(err);
		return res.status(400).json({message: err.message});
	}
}

export const list = async (req, res) => {
    try {
        return res.status(200).json({article: "Hi..."});
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