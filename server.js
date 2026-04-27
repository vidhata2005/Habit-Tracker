// ==============================
// server.js
// ==============================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

// Models
const User = require('./models/User');
const Habit = require('./models/Habit');
const ScheduledTask = require('./models/ScheduledTask');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = 10;

// ----------------- MIDDLEWARE -----------------
app.use(cors());
app.use(express.json());

// ----------------- MONGODB CONNECTION -----------------
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('💾 MongoDB connected (nosql)'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------- STATIC FILES & HOMEPAGE -----------------
// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// HOMEPAGE ROUTE - This sends your index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------- AUTH ROUTES -----------------

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(409).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ----------------- HABITS ROUTES -----------------

app.get('/api/habits', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error('Get habits error:', err);
    res.status(500).json({ message: 'Failed to fetch habits' });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId || !name)
      return res.status(400).json({ message: 'Missing fields' });

    const habit = new Habit(req.body);
    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ message: 'Failed to create habit' });
  }
});

app.put('/api/habits/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(habit);
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ message: 'Failed to update habit' });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete habit error:', err);
    res.status(500).json({ message: 'Failed to delete habit' });
  }
});

// ----------------- SCHEDULED TASK ROUTES -----------------

app.get('/api/scheduled-tasks', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const tasks = await ScheduledTask.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

app.post('/api/scheduled-tasks', async (req, res) => {
  try {
    const { userId, name, date, time } = req.body;
    if (!userId || !name || !date || !time)
      return res.status(400).json({ message: 'Missing fields' });

    const task = new ScheduledTask(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

app.put('/api/scheduled-tasks/:id', async (req, res) => {
  try {
    const task = await ScheduledTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

app.delete('/api/scheduled-tasks/:id', async (req, res) => {
  try {
    await ScheduledTask.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// ----------------- DASHBOARD -----------------
app.get('/api/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayDate = `${yyyy}-${mm}-${dd}`;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDay = dayNames[today.getDay()];

    const habits = await Habit.find({
      userId,
      completed: false,
      $or: [
        { repeat: 'daily' },
        { $and: [{ repeat: 'weekly' }, { days: { $in: [todayDay] } }] },
      ],
    }).sort({ time: 1 });

    const tasks = await ScheduledTask.find({
      userId,
      date: todayDate,
      completed: false,
    }).sort({ time: 1 });

    res.json({ habits, tasks });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to get dashboard items' });
  }
});

// ----------------- PROFILE ROUTES -----------------
const UserProfile = require('./models/UserProfile');

app.get('/api/profile', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const { userId, username, fullName, dob, passion, email, phone, profilePic } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    let profile = await UserProfile.findOne({ userId });
    if (profile) {
      Object.assign(profile, { username, fullName, dob, passion, email, phone, profilePic });
      await profile.save();
    } else {
      profile = new UserProfile({ userId, username, fullName, dob, passion, email, phone, profilePic });
      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ message: 'Failed to save profile' });
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`✅ Server running on: http://localhost:${PORT}`);
});