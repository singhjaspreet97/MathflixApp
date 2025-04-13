const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  average: { type: Number, default: 0, min: 0, max: 100 },
  timeStreamed: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1 },
  testTime: {type:Number, default: 5},
  highScore: { type: Number, default: 0, min: 0 },
  bestTime: { type: Number, default: 0, min: 0 },
  highestStreak: { type: Number, default: 0 },
  highScoreTime: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;