import Parcel from "../models/parcelModel.js";
import User from "../models/userModel.js";

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


// @desc    Assign an agent to a parcel
// @route   PUT /api/admin/assign/:id
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
    try {
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add filtering options (optional)
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.isActive) filter.isActive = req.query.isActive === 'true';

        // Get users with optional filtering and pagination
        const users = await User.find(filter)
            .select('-password') // Exclude passwords
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination info
        const total = await User.countDocuments(filter);

        res.status(200).json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
