const express     = require('express');
const router      = express.Router();
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

// GET budgets with spending progress
router.get('/', protect, async (req, res) => {
    try {
        const now   = new Date();
        const month = parseInt(req.query.month) || now.getMonth() + 1;
        const year  = parseInt(req.query.year)  || now.getFullYear();
        const budgets = await Budget.find({ user: req.user._id, month, year });

        const start = new Date(year, month - 1, 1);
        const end   = new Date(year, month, 0);

        const result = await Promise.all(budgets.map(async (b) => {
            const agg = await Transaction.aggregate([
                { $match: { user: req.user._id, type: 'expense', category: b.category, date: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const spent = agg[0]?.total || 0;
            return { ...b.toObject(), spent, percentage: Math.round((spent / b.amount) * 100) };
        }));
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create/update budget
router.post('/', protect, async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const existing = await Budget.findOne({ user: req.user._id, category, month, year });
        if (existing) {
            existing.amount    = amount;
            existing.alertSent = false;
            await existing.save();
            return res.json(existing);
        }
        const budget = await Budget.create({ user: req.user._id, category, amount, month, year });
        res.status(201).json(budget);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE budget
router.delete('/:id', protect, async (req, res) => {
    try {
        await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
