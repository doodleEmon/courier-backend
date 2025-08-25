import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    pickupAddress: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    parcelSize: {
        type: String,
        required: true,
    },
    parcelType: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['COD', 'Prepaid'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
        default: 'Pending',
    },
    currentLocation: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
    },

    trackingNumber: String,
    qrCode: String,
}, { timestamps: true });

const Parcel = mongoose.model('Parcel', parcelSchema);
export default Parcel;