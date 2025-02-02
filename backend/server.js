import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js'
import cors from 'cors';

import campaignRoutes from "./routes/campaign.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000

app.use(cors()); // Add CORS middleware here
app.use(express.json()); //allows us to accept JSON data in the req.body

app.use("/api/campaigns", campaignRoutes);

// Postman desktop application to test

app.listen(PORT, () => {
    connectDB();
    console.log('Server Started at http://localhost:'+ PORT);
});
