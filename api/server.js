import sirv from 'sirv';
import express from "express";
import compression from 'compression';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

// Import ENV --
import "./loadEnv.js";

// Import DB URL --
import { DB_URL } from "./configs/databases/eth-nft-marketplace.js";

// Import routes --
import { nftRoutes } from './routes/nft.js';

const app = express();
const dev = process.env.NODE_ENV === 'development';

// Connecting to mongodb --
mongoose.connect(DB_URL(), {});

// BodyParser Middleware --
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json({ 
	limit: "50mb",
	verify: function(req, res, buf, encoding) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}));

// Setup Cors --
app.use(cors({ origin: ['http://localhost:4200'], credentials: true }));

// Register Routes --
app.use("/nft", nftRoutes);

app.use(
	compression({ threshold: 0 }),
	sirv('static', { dev })
);

const appInstance = app.listen(process.env.PORT || 5050, () => {
	console.log(`🚀 Server ready at port ${process.env.PORT || 5050}`);
});

export {appInstance};