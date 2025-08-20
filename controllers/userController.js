import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validation: Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the new user in the database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role, // Role can be 'Customer', 'Delivery Agent', or 'Admin'
        });

        // 5. If user created successfully, send back user data and a token
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export default registerUser;