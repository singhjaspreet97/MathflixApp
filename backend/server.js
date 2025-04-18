// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./models/user');
const Blocklist = require('./models/Blocklist');
const ActiveSession = require('./models/ActiveSession');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.CLIENT_MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// API Route: Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    console.log("Generated token:", token);
    // ✅ RETURN token in response
    return res.json({
      message: 'Login successful',
      username: user.username,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API Route: Get Screen Time for logged-in user
app.get('/api/user/:username/screen-time', async (req, res) => {
  const { username } = req.params;
  const Quiz = require('./models/quiz');

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const quiz = await Quiz.findOne({ name: `Level ${user.level}` });

    return res.json({
      username: user.username,
      level: user.level,
      allowedTime: quiz ? quiz.allowedTime : 'N/A',
    });
  } catch (err) {
    console.error('Screen time fetch error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

// Get all blocklists for a user
app.get('/api/blocklists/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const lists = await Blocklist.find({ username });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update a blocklist
app.post('/api/blocklists', async (req, res) => {
  const { username, name, apps } = req.body;
  try {
    const existing = await Blocklist.findOne({ username, name });
    if (existing) {
      existing.apps = apps;
      await existing.save();
      return res.json({ message: 'Updated successfully' });
    } else {
      const newList = new Blocklist({ username, name, apps });
      await newList.save();
      return res.status(201).json({ message: 'Created successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blocklist
app.delete('/api/blocklists/:username/:name', async (req, res) => {
  const { username, name } = req.params;
  try {
    await Blocklist.deleteOne({ username, name });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update an active session
app.post('/api/active-session', async (req, res) => {
  const { username, blocklistName, device, start, end, allowedTime } = req.body;

  try {
    await ActiveSession.findOneAndUpdate(
      { username },
      { blocklistName, device, start, end, allowedTime },
      { upsert: true, new: true }
    );
    res.json({ message: 'Session started' });
  } catch (err) {
    console.error('Error creating/updating session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active session
app.get('/api/active-session/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const session = await ActiveSession.findOne({ username });
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// End/delete session
app.delete('/api/active-session/:username', async (req, res) => {
  const { username } = req.params;

  try {
    await ActiveSession.deleteOne({ username });
    res.json({ message: 'Session ended' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/session/end', async (req, res) => {
  const { username, endedAt } = req.body;
  try {
    console.log(`Session ended by ${username} at ${endedAt}`);
    // Optional: Store session end event in DB if needed
    res.status(200).json({ message: 'Session end logged successfully' });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

