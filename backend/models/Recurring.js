const mongoose = require('mongoose');
const recurringSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:        { type: String, enum: ['income', 'expense'], required: true },
    amount:      { type: Number, required: true },
    category:    { type: String, required: true },
    description: { type: String, default: '' },
    dayOfMonth:  { type: Number, required: true, min: 1, max: 31 },
    isActive:    { type: Boolean, default: true },
    lastRun:     { type: Date },
    nextRun:     { type: Date },
}, { timestamps: true });
module.exports = mongoose.model('Recurring', recurringSchema);
