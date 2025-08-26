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
        enum: ['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered', 'Failed'],
        default: 'Pending',
    },
    currentLocation: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
    },
    recipientName: {
        type: String,
        required: true
    },
    recipientPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number']
    },
    description: {
        type: String,
        required: true
    },

    trackingNumber: String,
    qrCode: String,
    trackingHistory: [
        {
            status: { type: String, required: true },
            location: {
                latitude: { type: Number },
                longitude: { type: Number },
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

const Parcel = mongoose.model('Parcel', parcelSchema);
export default Parcel;