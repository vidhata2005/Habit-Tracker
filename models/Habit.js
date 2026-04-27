// models/Habit.js
const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  time:        { type: String, default: '' }, // e.g. "07:00 AM"
  repeat:      { type: String, enum: ['daily','weekly'], default: 'daily' },
  days:        { type: [String], default: [] }, // e.g. ["Mon","Wed"]
  alarm:       { type: Boolean, default: false },
  reminder:    { type: Boolean, default: false },
  completed:   { type: Boolean, default: false },
  note:        { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
