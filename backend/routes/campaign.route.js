import express from 'express';
import mongoose from 'mongoose';

import { createCampaign, deleteCampaign, getCampaigns, updateCampaign } from '../controllers/product.controller.js';

const router = express.Router();

//use patch to update some fields //router.patch
//use put to update all fields //router.put

router.get("/", getCampaigns);
router.post("/", createCampaign);
router.put("/:id", updateCampaign); 
router.delete("/:id", deleteCampaign);

export default router;