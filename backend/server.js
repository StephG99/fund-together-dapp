//const express = require('express)
import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js'
import Campaign from './models/campaign.model.js';

dotenv.config();

const app = express();

//app.get("/campaigns",(req, res) => {
//})

app.post("/campaigns",async (req, res) => {
    const campaign = req.body; //user will send this data
    
    if(!campaign.name || !campaign.image || !campaign.goal) {
        return res.status(400).json({ success:false, message: "Please Provide all necessary fields"});
    }

    const newCampaign = new Campaign(campaign)

    try {
        await newCampaign.save();
        res.status(201).json({ success: true, data: newProduct});
    } catch (error) {
        console.error("Error Create Campaign", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
});

// Postman desktop application to test

//console.log(process.env.MONGO_URI);

app.listen(5000, () => {
    connectDB();
    console.log('Server Started at http://localhost:5000');
})
