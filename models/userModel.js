import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true, // No two users can share the same email
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [8, 'Password must be at least 8 characters']
        },
        role: {
            type: String,
            enum: ['Customer', 'Agent', 'Admin'], // The role must be one of these values
            default: 'Customer', // If no role is provided, it defaults to 'Customer'
        },
    },
    {
        timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
    }
);

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;