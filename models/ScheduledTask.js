// models/ScheduledTask.js
const mongoose = require('mongoose');

const ScheduledTaskSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  description:  { type: String, default: '' },
  date:         { type: String, required: true }, // YYYY-MM-DD
  time:         { type: String, required: true }, // e.g. "02:30 PM"
  status:       { type: String, default: 'pending' },
  alarm:        { type: Boolean, default: false },
  alarmDate:    { type: String, default: '' },
  alarmTime:    { type: String, default: '' },
  reminderDate: { type: String, default: '' },
  reminderTime: { type: String, default: '' },
  completed:    { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledTask', ScheduledTaskSchema);
