const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const user   = await User.create({ name, email, password: hashed });
        res.status(201).json({ token: genToken(user._id), user: { _id: user._id, name: user.name, email: user.email, darkMode: user.darkMode, currency: user.currency } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
        res.json({ token: genToken(user._id), user: { _id: user._id, name: user.name, email: user.email, darkMode: user.darkMode, currency: user.currency } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

router.put('/preferences', protect, async (req, res) => {
    try {
        const { darkMode, currency } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { darkMode, currency }, { new: true }).select('-password');
        res.json({ user });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
