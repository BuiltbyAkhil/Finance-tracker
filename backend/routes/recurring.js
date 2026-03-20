const express     = require('express');
const router      = express.Router();
const Recurring   = require('../models/Recurring');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const getNextRun = (day) => {
    const now  = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next;
};

// GET all recurring
router.get('/', protect, async (req, res) => {
    try {
        const items = await Recurring.find({ user: req.user._id }).sort('-createdAt');
        res.json(items);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create recurring
router.post('/', protect, async (req, res) => {
    try {
        const { type, amount, category, description, dayOfMonth } = req.body;
        const nextRun = getNextRun(dayOfMonth);
        const item = await Recurring.create({ user: req.user._id, type, amount, category, description, dayOfMonth, nextRun });
        res.status(201).json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT toggle active
router.put('/:id', protect, async (req, res) => {
    try {
        const item = await Recurring.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body, { new: true }
        );
        res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE recurring
router.delete('/:id', protect, async (req, res) => {
    try {
        await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST process due recurring (called on app load)
router.post('/process', protect, async (req, res) => {
    try {
        const now  = new Date();
        const due  = await Recurring.find({ user: req.user._id, isActive: true, nextRun: { $lte: now } });
        const created = [];
        for (const r of due) {
            const t = await Transaction.create({ user: req.user._id, type: r.type, amount: r.amount, category: r.category, description: r.description + ' (Auto)', date: new Date(), isRecurring: true, recurringId: r._id });
            r.lastRun = now;
            r.nextRun = getNextRun(r.dayOfMonth);
            await r.save();
            created.push(t);
        }
        res.json({ processed: created.length, transactions: created });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
