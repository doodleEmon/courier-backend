import express from 'express';
import { getAgentParcels, updateParcelStatus } from '../controllers/agentController';
import { authorize, protect } from '../middleware/authMiddleware';

const router = express.Router();

// Delivery Agent APIs
router.get("/agent", protect, authorize("Agent"), getAgentParcels);
router.put("/status/:id", protect, authorize("Agent"), updateParcelStatus);

export default router;