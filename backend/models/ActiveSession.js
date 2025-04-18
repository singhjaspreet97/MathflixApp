const mongoose = require('mongoose');

const activeSessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  blocklistName: { type: String, required: true },
  device: { type: String, default: 'Pixel 9' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allowedTime: { type: Number, default: 0 }
}, { timestamps: true });

const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);
module.exports = ActiveSession;