import Campaign from "../models/campaign.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({});
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    console.log("Error when fetching campaigns:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a new campaign
export const createCampaign = async (req, res) => {
  const { campaignContract, description } = req.body; // Extract non-file fields

  if (!campaignContract || !description || !req.file) {
    return res.status(400).json({
      success: false,
      message: "Please provide all necessary fields, including an image",
    });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "campaign-images",
    });

    const newCampaign = new Campaign({
      campaignContract,
      description,
      imageURL: result.secure_url,
    });

    await newCampaign.save();
    res.status(201).json({ success: true, data: newCampaign });
  } catch (error) {
    console.error("Error when creating Campaign:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateCampaign = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Campaign ID" });
  }

  const { description } = req.body;

  try {
    let updatedData = { description };

    // Handle image update
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "campaign-images",
      });
      updatedData.imageURL = result.secure_url;
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedCampaign });
  } catch (error) {
    console.error("Error when updating Campaign:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a campaign
export const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Campaign ID" });
  }

  try {
    await Campaign.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    console.log("Error when deleting campaign:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCampaignByContractAddress = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const campaign = await Campaign.findOne({
      campaignContract: contractAddress,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found." });
    }
    res.json({ success: true, data: campaign });
  } catch (err) {
    console.error("Error fetching campaign by contract address:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
