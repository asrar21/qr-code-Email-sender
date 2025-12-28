// src/controllers/qrController.js
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const { db } = require('../config/firebase');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate QR Code
exports.generateQR = async (req, res) => {
  try {
    const { qrtext, qrcolor = '#000000', qrtmail } = req.body;
    const user = req.user;

    // Check user's subscription limits
    const plans = await db.get('subscriptions');
    const userPlan = plans[user.subscriptionTier] || plans.free;
    
    // Check if user has reached their limit
    if ((user.qrCodesGenerated || 0) >= userPlan.qrCodesLimit) {
      return res.status(403).json({ 
        error: 'QR code limit reached. Please upgrade your subscription.',
        currentUsage: user.qrCodesGenerated || 0,
        limit: userPlan.qrCodesLimit
      });
    }

    // Generate QR Code
    const qrCodeDataURL = await QRCode.toDataURL(qrtext, {
      color: {
        dark: qrcolor,
        light: '#FFFFFF'
      },
      width: 300,
      margin: 1
    });

    // Update user's QR code count
    await db.update(`users/${user.id}`, {
      qrCodesGenerated: (user.qrCodesGenerated || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    // Save QR code to database
    const qrId = `qr_${Date.now()}`;
    await db.set(`qr_codes/${qrId}`, {
      userId: user.id,
      text: qrtext,
      color: qrcolor,
      generatedAt: new Date().toISOString(),
      emailSent: !!qrtmail
    });

    const response = {
      success: true,
      qrCode: qrCodeDataURL,
      id: qrId,
      usage: {
        current: (user.qrCodesGenerated || 0) + 1,
        limit: userPlan.qrCodesLimit
      }
    };

    // Send email if requested
    if (qrtmail) {
      // Check if email delivery is available for the plan
      if (!userPlan.features.includes('Email Delivery') && user.subscriptionTier !== 'premium') {
        return res.status(403).json({ 
          ...response,
          warning: 'Email delivery not available for your current plan'
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: qrtmail,
        subject: 'Your QR Code',
        html: `
          <html>
            <body>
              <h2>Your QR Code</h2>
              <p>Dear user, here is your QR code in the attachment, generated from your text: "${qrtext}"</p>
              <p>Thank you for using our service!</p>
            </body>
          </html>
        `,
        attachments: [{
          filename: 'qrcode.png',
          content: qrCodeDataURL.split('base64,')[1],
          encoding: 'base64'
        }]
      };

      await transporter.sendMail(mailOptions);
      response.message = 'QR code generated and email sent successfully';
    } else {
      response.message = 'QR code generated successfully';
    }

    res.json(response);
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Error generating QR code' });
  }
};

// Get user's QR code history
exports.getQRHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all QR codes
    const allQRCodes = await db.get('qr_codes');
    
    if (!allQRCodes) {
      return res.json({
        success: true,
        count: 0,
        qrCodes: []
      });
    }
    
    // Filter by user ID
    const userQRCodes = [];
    Object.keys(allQRCodes).forEach(key => {
      if (allQRCodes[key].userId === userId) {
        userQRCodes.push({
          id: key,
          ...allQRCodes[key]
        });
      }
    });
    
    // Sort by date (newest first)
    userQRCodes.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    res.json({
      success: true,
      count: userQRCodes.length,
      qrCodes: userQRCodes
    });
  } catch (error) {
    console.error('Get QR history error:', error);
    res.status(500).json({ error: 'Error fetching QR code history' });
  }
};