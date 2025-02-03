import express from 'express';
import mongoose from 'mongoose';
import multer from "multer";

import { createCampaign, deleteCampaign, getCampaigns, updateCampaign } from '../controllers/campaign.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.get("/", getCampaigns);
router.post("/", upload.single("image"), createCampaign); // Add multer middleware for image uploads
router.put("/:id", upload.single("image"), updateCampaign); // Add multer middleware for image updates 
router.delete("/:id", deleteCampaign);

export default router;