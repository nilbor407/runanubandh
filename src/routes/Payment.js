const express = require('express');
// Remove Razorpay imports since we're only using PhonePay
const { JWTScreatKey } = require('../common/Constants');
const User = require('../models/User');
const { ErrorResponse } = require('../helper/response');
const { errorMessage } = require('../common/StatusCodes');
const jwt = require('jsonwebtoken');
const { logPaymentRequest } = require('../middleware/PaymentLogger');
const { savePaymentInfo, verifyPaymentInfo } = require('../utils/PaymentUtils');

const router = express.Router();

// Add payment logging middleware to all routes
router.use(logPaymentRequest);

// Disable Razorpay order creation - redirect to PhonePay
router.post('/order', async (req, res) => {
  console.log('Order creation requested, but we only support PhonePay payments');
  return new ErrorResponse(res, {
    message: 'This payment method is not supported. Please use PhonePay payment.',
    supportedMethods: ['phonepe']
  });
});

// Disable Razorpay payment processing - redirect to PhonePay
router.post('/payment', async (req, res) => {
  console.log('Razorpay payment callback received, but we only support PhonePay');
  return new ErrorResponse(res, {
    message: 'This payment method is not supported. Please use PhonePay payment.',
    supportedMethods: ['phonepe']
  });
});

// Add PhonePay specific endpoints
router.post('/phonepe/order', async (req, res) => {
  console.log('PhonePay order creation requested:', req.body);

  try {
    const { userId } = req.body;

    if (!userId) {
      return new ErrorResponse(res, {
        message: 'User ID is required'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return new ErrorResponse(res, {
        message: errorMessage.USER_NOT_FOUND
      });
    }

    // Generate unique transaction ID
    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Return transaction details for PhonePay integration
    res.json({
      success: true,
      transactionId: transactionId,
      userId: userId,
      amount: 1111, // Fixed subscription amount
      currency: 'INR',
      message: 'Transaction ID generated successfully'
    });

  } catch (error) {
    console.error('Error creating PhonePay order:', error);
    return new ErrorResponse(res, error.message);
  }
});

router.post('/orderdetails', (req, res) => {
  User.findOne({
    'orderInfo.orderId': req?.body?.orderId,
  })
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }
      res.json({ data });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
});

// Add endpoint to check payment status for debugging
router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const verificationResult = await verifyPaymentInfo(userId);
    res.json(verificationResult);
  } catch (error) {
    console.error('Error in payment status endpoint:', error);
    return new ErrorResponse(res, error.message);
  }
});

module.exports = router;
