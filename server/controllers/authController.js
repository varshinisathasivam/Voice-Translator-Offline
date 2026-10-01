const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getInMemoryUsers } = require('../middleware/auth');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

const sendToken = (res, user, statusCode = 200) => {
  const token = signToken(user._id || user.id);
  const userData = { ...user };
  delete userData.password;
  res.status(statusCode).json({ success: true, token, user: userData });
};

const mongoose = require('mongoose');

// ─── In-memory fallback store ─────────────────────────────────────────────────
const inMemoryUsers = getInMemoryUsers();
// Seed a demo user (password: password123)
const demoId = 'demo-user-001';
inMemoryUsers.set(demoId, {
  id: demoId, _id: demoId, name: 'Demo User',
  email: 'demo@example.com',
  // Valid bcrypt hash for 'password123'
  password: '$2a$10$/sQIDZNsZ31jkHAm.cXy.OaF0VvAZgyjUkrTFvCSKh30fqZ88eb5e',
  translationCount: 12, preferredLanguages: ['en', 'ta'], createdAt: new Date(),
});

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  if (isDbConnected()) {
    try {
      const User = require('../models/User');
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
      const user = await User.create({ name, email, password });
      return sendToken(res, user.toJSON(), 201);
    } catch (dbErr) {
      // Fall through to in-memory
    }
  }

  // Fallback: in-memory
  for (const u of inMemoryUsers.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
  }
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id,
    _id: id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    translationCount: 0,
    preferredLanguages: ['en', 'ta'],
    createdAt: new Date(),
  };
  inMemoryUsers.set(id, user);
  sendToken(res, user, 201);
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  if (isDbConnected()) {
    try {
      const User = require('../models/User');
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user && (await user.comparePassword(password))) {
        return sendToken(res, user.toJSON());
      }
      if (user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (dbErr) {
      // Fall through to in-memory
    }
  }

  // Fallback: in-memory
  let found = null;
  for (const u of inMemoryUsers.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      found = u;
      break;
    }
  }
  if (!found) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, found.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  sendToken(res, found);
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { name, preferredLanguages } = req.body;
  const userId = String(req.user._id || req.user.id);
  if (isDbConnected()) {
    try {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(userId, { name, preferredLanguages }, { new: true });
      if (user) return res.json({ success: true, user });
    } catch (dbErr) {}
  }

  const user = inMemoryUsers.get(userId);
  if (user) {
    user.name = name || user.name;
    user.preferredLanguages = preferredLanguages || user.preferredLanguages;
  }
  res.json({ success: true, user: user || req.user });
};
