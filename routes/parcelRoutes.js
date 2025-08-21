import express from "express";
import {
    createParcel,
    getCustomerParcels,
    getAgentParcels,
    getAdminParcels,
    updateParcelStatus,
    assignAgentToParcel,
} from "../controllers/parcelController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer APIs
router.post("/", protect, authorize("Customer"), createParcel);
router.get("/customer", protect, authorize("Customer"), getCustomerParcels);

// Delivery Agent APIs
router.get("/agent", protect, authorize("Agent"), getAgentParcels);
router.put("/status/:id", protect, authorize("Agent"), updateParcelStatus);

// Admin APIs
router.get("/admin", protect, authorize("Admin"), getAdminParcels);
router.put("/assign/:id", protect, authorize("Admin"), assignAgentToParcel);

export default router;
