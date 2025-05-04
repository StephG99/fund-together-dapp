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
router.post("/", upload.single("image"), createCampaign);
router.put("/:id", upload.single("image"), updateCampaign);
router.delete("/:id", deleteCampaign);

router.get("/addr/:contractAddress", getCampaignByContractAddress);

export default router;
