import Campaign from "../models/campaign.model.js";
import mongoose from "mongoose";

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({}); //empty means fetch all
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        console.log("Error when fetching campaigns:", error.message);
        res.status(500).json({ sucess: false, message: "Server Error" });
    }
};

export const createCampaign = async (req, res) => {
    const campaign = req.body; //user will send this data
    
    if(!campaign.campaignContract || !campaign.description || !campaign.imageURL) {
        return res.status(400).json({ success:false, message: "Please Provide all necessary fields" });
    }

    const newCampaign = new Campaign(campaign)

    try {
        await newCampaign.save();
        res.status(201).json({ success: true, data: newCampaign});
    } catch (error) {
        console.error("Error when creating Campaign", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
};

export const updateCampaign = async (req, res) => {
    const { id } = req.params;

    const campaign = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status.apply(404).json({ success:false, message:"Invalid Campaign ID"});
    }

    try {
        const updatedCampaign = await Campaign.findByIdAndUpdate(id, campaign, {new:true});
        res.status(200).json({ success: true, data: updatedCampaign });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error"});
    }
};


export const deleteCampaign = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status.apply(404).json({ success:false, message:"Invalid Campaign ID"});
    }
    
    try {
        await Campaign.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Campaign deleted"});
    } catch (error) {
        console.log("Error when deleting campaign:", error.message);
        res.status(500).json({ success: false, message: "Server Error"})
    }
};