import express from 'express';
import { assignAgentToParcel, getAdminParcels, getAdminUsers, updateUserRole, deleteUser, updateParcelStatus } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/users", protect, authorize("Admin"), getAdminUsers);
router.put("/users/:id/role", protect, authorize("Admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("Admin"), deleteUser);
router.get("/parcels", protect, authorize("Admin"), getAdminParcels);
router.put("/assign/:id", protect, authorize("Admin"), assignAgentToParcel);
router.put("/parcels/:id/status", protect, authorize("Admin"), updateParcelStatus);

export default router;