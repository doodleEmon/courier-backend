import express from 'express';
import { assignAgentToParcel, getAdminParcels, getAdminUsers } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/users", protect, authorize("Admin"), getAdminUsers);
router.get("/parcels", protect, authorize("Admin"), getAdminParcels);
router.put("/assign/:id", protect, authorize("Admin"), assignAgentToParcel);

export default router;