const express = require('express');
const router = express.Router();
const User = require('../schema/UserSchema');
 const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
    console.log(req.body);

    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);
        // console.log('User Password Hash:', hashedPassword);
        // Create a new user
        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();
        return res.status(201).json({ message: "User registered" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
