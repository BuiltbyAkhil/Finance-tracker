const express     = require('express');
const router      = express.Router();
const Transaction = require('../models/Transaction');
const Budget      = require('../models/Budget');
const nodemailer  = require('nodemailer');
const { protect } = require('../middleware/authMiddleware');

// Send budget alert email
const sendBudgetAlert = async (email, name, category, spent, budget) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_email')) return;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `⚠️ Budget Alert: ${category} limit exceeded!`,
            html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
                <h2 style="color:#ef4444">⚠️ Budget Exceeded!</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>You have exceeded your <strong>${category}</strong> budget this month.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <tr><td style="padding:8px;background:#f8f9fa">Budget Limit</td><td style="padding:8px;background:#f8f9fa;color:#6366f1;font-weight:bold">₹${budget}</td></tr>
                  <tr><td style="padding:8px">Amount Spent</td><td style="padding:8px;color:#ef4444;font-weight:bold">₹${spent}</td></tr>
                  <tr><td style="padding:8px;background:#f8f9fa">Over Budget By</td><td style="padding:8px;background:#f8f9fa;color:#ef4444;font-weight:bold">₹${spent - budget}</td></tr>
                </table>
                <p style="color:#64748b;font-size:14px">Keep track of your spending on Finance Tracker.</p>
            </div>`
        });
    } catch (err) { console.log('Email not sent:', err.message); }
};

// GET all transactions with filters
router.get('/', protect, async (req, res) => {
    try {
        const { type, category, startDate, endDate, limit } = req.query;
        const filter = { user: req.user._id };
        if (type)      filter.type = type;
        if (category)  filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate)   filter.date.$lte = new Date(endDate);
        }
        let query = Transaction.find(filter).sort({ date: -1 });
        if (limit) query = query.limit(parseInt(limit));
        const transactions = await query;
        res.json(transactions);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add transaction
router.post('/', protect, async (req, res) => {
    try {
        const { type, amount, category, description, date, isRecurring, recurringId } = req.body;
        if (!type || !amount || !category || !date) return res.status(400).json({ message: 'Required fields missing' });

        const transaction = await Transaction.create({ user: req.user._id, type, amount, category, description, date, isRecurring, recurringId });

        // Check budget if expense
        if (type === 'expense') {
            const d = new Date(date);
            const budget = await Budget.findOne({ user: req.user._id, category, month: d.getMonth() + 1, year: d.getFullYear() });
            if (budget && !budget.alertSent) {
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                const agg   = await Transaction.aggregate([
                    { $match: { user: req.user._id, type: 'expense', category, date: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const spent = agg[0]?.total || 0;
                if (spent >= budget.amount) {
                    budget.alertSent = true;
                    await budget.save();
                    await sendBudgetAlert(req.user.email, req.user.name, category, spent, budget.amount);
                }
            }
        }
        res.status(201).json(transaction);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE transaction
router.delete('/:id', protect, async (req, res) => {
    try {
        await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET summary stats
router.get('/summary', protect, async (req, res) => {
    try {
        const now   = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthly = await Transaction.aggregate([
            { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);

        const allTime = await Transaction.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);

        const get = (arr, type) => arr.find(x => x._id === type)?.total || 0;
        res.json({
            monthlyIncome:  get(monthly, 'income'),
            monthlyExpense: get(monthly, 'expense'),
            totalIncome:    get(allTime, 'income'),
            totalExpense:   get(allTime, 'expense'),
            balance:        get(allTime, 'income') - get(allTime, 'expense'),
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET chart data - expenses by category
router.get('/charts/category', protect, async (req, res) => {
    try {
        const now   = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const data  = await Transaction.aggregate([
            { $match: { user: req.user._id, type: 'expense', date: { $gte: start } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);
        res.json(data.map(d => ({ name: d._id, value: d.total })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET chart data - monthly income vs expense (last 6 months)
router.get('/charts/monthly', protect, async (req, res) => {
    try {
        const results = [];
        for (let i = 5; i >= 0; i--) {
            const d     = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const agg   = await Transaction.aggregate([
                { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
                { $group: { _id: '$type', total: { $sum: '$amount' } } }
            ]);
            const get = (type) => agg.find(x => x._id === type)?.total || 0;
            results.push({
                month:   start.toLocaleString('default', { month: 'short', year: '2-digit' }),
                income:  get('income'),
                expense: get('expense'),
                balance: get('income') - get('expense'),
            });
        }
        res.json(results);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET export CSV
router.get('/export/csv', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        const header = 'Date,Type,Category,Description,Amount\n';
        const rows   = transactions.map(t =>
            `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},"${t.description}",${t.amount}`
        ).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.send(header + rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
