// backend/models/quiz.js
const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  allowedTime: { type: Number, default: 90 },
  testTime: { type: Number, default: 10 },
  questionFactor: { type: Number, default: 0 },
  questionDecisionFactor: { type: Number, default: 0 },
  testTimeDecisionFactor: { type: Number, default: 0 },
  incorrectDecisionFactor: { type: Number, default: 0 }
});

module.exports = mongoose.model('Quiz', QuizSchema);
