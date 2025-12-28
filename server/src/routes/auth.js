// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Signup validation
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

module.exports = router;