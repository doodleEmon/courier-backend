
import express from 'express';
import { getAgentParcels, updateParcelStatus, getAgentProfile, getOptimizedDeliveryRoute } from '../controllers/agentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Delivery Agent APIs
router.get("/profile", protect, authorize("Agent"), getAgentProfile);
router.get("/parcels", protect, authorize("Agent"), getAgentParcels);
router.put("/parcels/:id/status", protect, authorize("Agent"), updateParcelStatus);
router.get("/route", protect, authorize("Agent"), getOptimizedDeliveryRoute);

export default router;
