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
        house: { type: String, required: true },
        street: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        division: { type: String, required: true },
        postalCode: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    deliveryAddress: {
        house: { type: String, required: true },
        street: { type: String, required: true },
        area: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        division: { type: String, required: true },
        postalCode: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },
    parcelSize: {
        type: String, // e.g., 'Small', 'Medium', 'Large'
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