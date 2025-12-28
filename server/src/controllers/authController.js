// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { db } = require('../config/firebase');

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

// Hash Password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Signup
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUsers = await db.queryByChild('users', 'email', email);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      email,
      name,
      password: hashedPassword,
      role: 'user',
      subscriptionTier: 'free',
      qrCodesGenerated: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Realtime Database
    await db.set(`users/${userId}`, userData);

    // Generate JWT token
    const token = generateToken(userId, email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role: 'user',
        subscriptionTier: 'free'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const users = await db.queryByChild('users', 'email', email);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id, email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = req.user;
    
    // Get fresh data from database
    const userData = await db.get(`users/${user.id}`);
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      user: {
        id: user.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
};