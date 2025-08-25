import Parcel from "../models/parcelModel.js";
import User from "../models/userModel.js";

// @desc    Create a new parcel
// @route   POST /api/parcel
// @access  Private/Customer
export const createParcel = async (req, res) => {
    try {
        const newParcel = await Parcel.create({
            ...req.body,
            customerId: req.user._id,
        });
        res.status(201).json(newParcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parcels for a customer
// @route   GET /api/parcel/customer
// @access  Private/Customer
export const getCustomerParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ customerId: req.user._id });
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a parcel (Customer can only edit their own parcels)
// @route   PUT /api/parcel/:id
// @access  Private/Customer
export const updateParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        // Check if the parcel belongs to the authenticated customer
        if (parcel.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this parcel" });
        }

        // Restrict editing based on parcel status
        if (parcel.status === "Delivered" || parcel.status === "In Transit") {
            return res.status(400).json({
                message: "Cannot edit parcel that is already in transit or delivered"
            });
        }

        const allowedUpdates = [
            'parcelSize',
            'parcelType',
            'paymentType',
            'pickupAddress',
            'deliveryAddress',
            'recipientName',
            'recipientPhone',
            'description'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedParcel = await Parcel.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedParcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a parcel (Customer can only delete their own parcels)
// @route   DELETE /api/parcel/:id
// @access  Private/Customer
export const deleteParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        // Check if the parcel belongs to the authenticated customer
        if (parcel.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this parcel" });
        }

        // Restrict deletion based on parcel status
        if (parcel.status === "In Transit" || parcel.status === "Delivered") {
            return res.status(400).json({
                message: "Cannot delete parcel that is in transit or already delivered"
            });
        }

        // If parcel is assigned to an agent and status is "Picked Up", don't allow deletion
        if (parcel.agentId && parcel.status === "Picked Up") {
            return res.status(400).json({
                message: "Cannot delete parcel that has been picked up by an agent"
            });
        }

        await Parcel.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Parcel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get parcels assigned to a delivery agent
// @route   GET /api/parcels/agent
// @access  Private/Agent
export const getAgentParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ agentId: req.user._id });
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parcels for the admin dashboard
// @route   GET /api/parcels/admin
// @access  Private/Admin
export const getAdminParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find()
            .populate("customerId", "name email")
            .populate("agentId", "name email");

        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel status
// @route   PUT /api/parcels/status/:id
// @access  Private/Agent
export const updateParcelStatus = async (req, res) => {
    try {
        const { status, latitude, longitude } = req.body;
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (parcel.agentId && parcel.agentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this parcel" });
        }

        parcel.status = status;
        parcel.currentLocation = { latitude, longitude };
        await parcel.save();

        // Get the `io` instance from the request
        const io = req.app.get('socketio');

        // Emit a real-time update
        io.emit('parcelStatusUpdate', {
            parcelId: parcel._id,
            status: parcel.status,
            currentLocation: parcel.currentLocation,
        });

        res.status(200).json(parcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign an agent to a parcel
// @route   PUT /api/parcels/assign/:id
// @access  Private/Admin
export const assignAgentToParcel = async (req, res) => {
    try {
        const { agentId } = req.body;
        const parcel = await Parcel.findById(req.params.id);
        const agent = await User.findById(agentId);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (!agent || agent.role !== "Agent") {
            return res.status(404).json({ message: "Invalid agent ID provided" });
        }

        parcel.agentId = agentId;
        await parcel.save();

        res.status(200).json(parcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
