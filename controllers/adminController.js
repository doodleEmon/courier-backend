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

        // Populate customerId and agentId before sending the response
        const populatedParcel = await Parcel.findById(parcel._id)
            .populate("customerId", "name email")
            .populate("agentId", "name email");

        res.status(200).json(populatedParcel);
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!['Customer', 'Agent', 'Admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role provided" });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update parcel status
// @route   PUT /api/admin/parcels/:id/status
// @access  Private/Admin
export const updateParcelStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (!['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered', 'Failed'].includes(status)) {
            return res.status(400).json({ message: "Invalid parcel status provided" });
        }

        parcel.status = status;
        await parcel.save();

        res.status(200).json({ message: "Parcel status updated successfully", parcel });
    } catch (error) {
        console.error('Error updating parcel status:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
