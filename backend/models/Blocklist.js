const mongoose = require('mongoose');

const BlocklistSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true }, // Blocklist name
  apps: [String], // Array of app names or IDs
});

module.exports = mongoose.model('Blocklist', BlocklistSchema);
