import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createParcel, deleteParcel, getCustomerParcels, updateParcel } from "../controllers/customerController.js";

const router = express.Router();

router.post("/parcels/create", protect, authorize("Customer"), createParcel);
router.get("/parcels", protect, authorize("Customer"), getCustomerParcels);
router.put("/parcels/:id", protect, authorize("Customer"), updateParcel);
router.delete("/parcels/:id", protect, authorize("Customer"), deleteParcel);

export default router;
