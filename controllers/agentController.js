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