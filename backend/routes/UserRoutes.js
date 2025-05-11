const express = require('express');
const { createUser, getUserByEmail } = require('../models/Users');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(400).send('Email already registered');
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({ username, email, passwordHash });
    res.status(201).send('User registered');
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return res.status(400).send('Username or email already exists');
    }
    res.status(500).send('Error registering user');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).send('Invalid credentials');
    const bcrypt = require('bcryptjs');
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) return res.status(400).send('Invalid credentials');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

module.exports = router;
