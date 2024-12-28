const express = require('express');
const router = express.Router();
const User = require('../schema/UserSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(400).json({ message: 'Email not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match status:', isMatch);
        console.log('Login attempt:', { email });
        console.log('Stored Hash:', user.password); // Login
        console.log('Input Password:', password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        console.log('Token generated:', token);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router;
