
import Parcel from "../models/parcelModel.js";
import User from "../models/userModel.js";

// @desc    Get parcels assigned to a delivery agent
// @route   GET /api/agent/parcels
// @access  Private/Agent
export const getAgentParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ agentId: req.user._id })
            .populate("customerId", "name email")
            .sort({ createdAt: -1 });

        if (!parcels) {
            return res.status(404).json({ message: "No parcels found for this agent" });
        }

        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel status
// @route   PUT /api/agent/parcels/:id/status
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

        // Validate status
        const allowedStatusUpdates = ['Picked Up', 'In Transit', 'Delivered', 'Failed'];
        if (!allowedStatusUpdates.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        parcel.status = status;

        // Add location to tracking history
        if (latitude && longitude) {
            parcel.currentLocation = { latitude, longitude };
            parcel.trackingHistory.push({
                status,
                location: { latitude, longitude },
            });
        } else {
            parcel.trackingHistory.push({ status });
        }

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

// @desc    Get agent profile
// @route   GET /api/agent/profile
// @access  Private/Agent
export const getAgentProfile = async (req, res) => {
    try {
        const agent = await User.findById(req.user._id).select("-password");

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        res.status(200).json(agent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get optimized delivery route for the agent
// @route   GET /api/agent/route
// @access  Private/Agent
export const getOptimizedDeliveryRoute = async (req, res) => {
    try {
        const agentParcels = await Parcel.find({
            agentId: req.user._id,
            status: { $in: ['Accepted', 'Picked Up', 'In Transit'] }
        })
            .select('pickupAddress deliveryAddress status')
            .sort({ createdAt: 1 }); // Process oldest parcels first

        if (!agentParcels || agentParcels.length === 0) {
            return res.status(404).json({ message: "No active parcels to generate a route for." });
        }

        // Prepare waypoints for Google Maps API
        const waypoints = agentParcels.map(parcel => ({
            location: parcel.deliveryAddress,
            stopover: true,
        }));

        // The agent's starting point could be their current location or a default address
        const origin = "Agent's Current Location or Office Address"; // Replace with actual data

        // The final destination could be the last parcel's delivery address
        const destination = waypoints.pop().location;

        // Construct the Google Maps Directions API URL
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!googleMapsApiKey) {
            return res.status(500).json({ message: "Google Maps API key is missing." });
        }

        const mapsApiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=optimize:true|${waypoints.map(wp => encodeURIComponent(wp.location)).join('|')}&key=${googleMapsApiKey}`;

        // Fetch the optimized route from Google Maps
        const response = await fetch(mapsApiUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(500).json({
                message: "Failed to fetch optimized route from Google Maps.",
                error: data.error_message || data.status
            });
        }

        // Send the optimized route to the agent
        res.status(200).json({
            route: data.routes[0], // The first route is the optimized one
            parcels: agentParcels,
        });

    } catch (error) {
        console.error("Error in getOptimizedDeliveryRoute:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
