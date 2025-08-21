const Parcel = require('../models/Parcel');
const User = require('../models/User'); // Assuming you have a User model

// @desc    Create a new parcel
// @route   POST /api/parcels
// @access  Private/Customer
exports.createParcel = async (req, res) => {
    try {
        const newParcel = await Parcel.create({
            ...req.body,
            customerId: req.user._id, // Set the customer ID from the authenticated user
        });
        res.status(201).json(newParcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parcels for a customer
// @route   GET /api/parcels/customer
// @access  Private/Customer
exports.getCustomerParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ customerId: req.user._id });
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get parcels assigned to a delivery agent
// @route   GET /api/parcels/agent
// @access  Private/Agent
exports.getAgentParcels = async (req, res) => {
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
exports.getAdminParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find().populate('customerId', 'name email').populate('agentId', 'name email');
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel status
// @route   PUT /api/parcels/status/:id
// @access  Private/Agent
exports.updateParcelStatus = async (req, res) => {
    try {
        const { status, latitude, longitude } = req.body;
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        if (parcel.agentId && parcel.agentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this parcel' });
        }

        parcel.status = status;
        parcel.currentLocation = { latitude, longitude };
        await parcel.save();

        // TODO: Emit real-time update using Socket.IO here
        // Example: io.emit('parcelStatusUpdate', { parcelId: parcel._id, status: parcel.status });

        res.status(200).json(parcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign an agent to a parcel
// @route   PUT /api/parcels/assign/:id
// @access  Private/Admin
exports.assignAgentToParcel = async (req, res) => {
    try {
        const { agentId } = req.body;
        const parcel = await Parcel.findById(req.params.id);
        const agent = await User.findById(agentId);

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        if (!agent || agent.role !== 'agent') {
            return res.status(404).json({ message: 'Invalid agent ID provided' });
        }

        parcel.agentId = agentId;
        await parcel.save();
        res.status(200).json(parcel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};