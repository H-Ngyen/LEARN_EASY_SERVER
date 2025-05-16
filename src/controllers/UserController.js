import User from '../models/user.js';
import bcrypt from 'bcrypt';

async function Login(req, res) {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    try {
        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { userName: identifier }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password with hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Return success response with user data (excluding password)
        res.status(200).json({
            message: 'Login successful',
            user: {
                userId: user.userId,
                userName: user.userName,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function Register(req, res) {
    try {
        const { userId, userName, password, name, email } = req.body;

        // Hash password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            userId,
            userName,
            password: hashedPassword,
            name,
            email
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: { userId, userName, name, email } });
    } catch (error) {
        res.status(500).json({ message: 'Registration error', error: error.message });
    }
}

export default {
    Login,
    Register
}