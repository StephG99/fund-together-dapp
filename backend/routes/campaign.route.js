import express from "express";
import mongoose from "mongoose";
import multer from "multer";

import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
  getCampaignByContractAddress,
} from "../controllers/campaign.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.get("/", getCampaigns);
router.post("/", upload.single("image"), createCampaign); // Add multer middleware for image uploads
router.put("/:id", upload.single("image"), updateCampaign); // Add multer middleware for image updates
router.delete("/:id", deleteCampaign);

// 2) New route to get a campaign by contract address
//    e.g. GET /api/campaigns/addr/0x1234abcd...
router.get("/addr/:contractAddress", getCampaignByContractAddress);

export default router;
