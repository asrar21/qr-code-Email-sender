// src/routes/qr.js
const express = require('express');
const { generateQR, getQRHistory } = require('../controllers/qrController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate QR code
router.post('/generate', generateQR);

// Get QR code history
router.get('/history', getQRHistory);

module.exports = router;