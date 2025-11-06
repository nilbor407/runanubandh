const axios = require('axios');
const crypto = require('crypto');
const {
  salt_key,
  merchant_id,
  subscriptionAmount,
  payemntRedirectUrl,
  JWTScreatKey,
  frontendPaymentRedirectURL,
} = require('../common/Constants');
const { ErrorResponse } = require('../helper/response');
const { errorMessage } = require('../common/StatusCodes');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { savePaymentInfo } = require('../utils/PaymentUtils');

const makePayment = async (req, res) => {
  console.log('makePayment called with request body:', req.body);

  try {
    let { transactionId, userId, userDetails } = req.body;

    if (!transactionId || !userId) {
      return new ErrorResponse(res, {
        message: 'Missing required parameters: transactionId or userId',
      });
    }

    // Get user details from database
    const user = await User.findById(userId);
    if (!user) {
      return new ErrorResponse(res, {
        message: errorMessage.USER_NOT_FOUND,
      });
    }

    const data = {
      merchantId: merchant_id,
      merchantTransactionId: transactionId,
      name: user.userDetails?.basicDetails?.name || "User Name",
      amount: subscriptionAmount * 100, // Amount in paisa
      redirectUrl: `${payemntRedirectUrl}?id=${transactionId}&userId=${userId}`,
      redirectMode: 'GET',
      mobileNumber: user.mobileNumber || "9999999999",
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    console.log('PhonePe payment data:', data);

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    // Use production URL for live payments
    const prod_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
    // For testing, use: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    const options = {
      method: 'POST',
      url: prod_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    console.log('Making payment request to PhonePe...');

    const response = await axios(options);
    console.log('PhonePe payment response:', response.data);

    // Save transaction details to user
    await User.findByIdAndUpdate(userId, {
      orderInfo: {
        transactionId: transactionId,
        amount: subscriptionAmount,
        currency: 'INR',
        merchantId: merchant_id,
        createdAt: new Date().toISOString()
      }
    });

    return res.json(response.data);

  } catch (error) {
    console.error('Error in makePayment:', error.response?.data || error.message);
    return new ErrorResponse(res, {
      message: 'Payment initiation failed. Please try again.',
      error: error.response?.data || error.message
    });
  }
};

const verifyPayemt = async (req, res) => {
  console.log('verifyPayment called with query params:', req.query);

  const { id, userId } = req.query;

  if (!id || !userId) {
    console.error('Missing required parameters:', { id, userId });
    const url = `${frontendPaymentRedirectURL}/fail?error=missing_params`;
    return res.redirect(url);
  }

  try {
    const merchantId = merchant_id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${id}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const options = {
      method: 'GET',
      url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${id}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`,
      },
    };

    console.log('Making payment verification request to PhonePe...');
    console.log('Verification URL:', options.url);

    const response = await axios.request(options);
    console.log('PhonePe verification response:', response.data);

    // Handle different response scenarios
    if (!response.data) {
      console.error('Empty response from PhonePe');
      const url = `${frontendPaymentRedirectURL}/fail?error=empty_response`;
      return res.redirect(url);
    }

    if (response.data.success === true && response.data.code === 'PAYMENT_SUCCESS') {
      console.log('Payment successful, saving payment info...');
      await verifyPaymentSuccess({ userId, paymentInfo: response.data, req, res });
    } else if (response.data.success === false) {
      console.log('Payment failed:', response.data);
      const url = `${frontendPaymentRedirectURL}/fail?error=${response.data.code}&message=${encodeURIComponent(response.data.message || 'Payment failed')}`;
      return res.redirect(url);
    } else {
      console.log('Payment status unclear:', response.data);
      const url = `${frontendPaymentRedirectURL}/fail?error=status_unclear`;
      return res.redirect(url);
    }

  } catch (error) {
    console.error('Error verifying payment with PhonePe:', error.response?.data || error.message);
    const url = `${frontendPaymentRedirectURL}/fail?error=verification_failed`;
    return res.redirect(url);
  }
};

const verifyPaymentSuccess = async ({ userId, paymentInfo, req, res }) => {
  console.log('verifyPaymentSuccess called with:', { userId, paymentInfo });

  try {
    // Verify user exists before saving payment info
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.error('User not found for payment success:', userId);
      const url = `${frontendPaymentRedirectURL}/fail?error=user_not_found`;
      return res.redirect(url);
    }

    console.log('User found, proceeding to save payment info...');

    // Use the utility function to save payment info consistently
    const updatedUser = await savePaymentInfo(userId, paymentInfo, 'phonepe');

    console.log('Payment info saved successfully!');
    console.log('Updated user payment info:', updatedUser.paymentInfo);

    // Double-check that payment info was actually saved
    const verificationUser = await User.findById(userId).select('paymentInfo token');
    if (!verificationUser.paymentInfo) {
      console.error('Payment info verification failed - not found in database');
      const url = `${frontendPaymentRedirectURL}/fail?error=save_verification_failed`;
      return res.redirect(url);
    }

    console.log('Payment info verification successful');

    const redirectUrl = `${frontendPaymentRedirectURL}/validate?token=${updatedUser?.token
      }&type=${paymentInfo.code === 'PAYMENT_SUCCESS' ? 1 : 0}&userId=${userId}`;

    console.log('Redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error in verifyPaymentSuccess:', error);
    const url = `${frontendPaymentRedirectURL}/fail?error=save_failed&message=${encodeURIComponent(error.message)}`;
    return res.redirect(url);
  }
};

module.exports = {
  makePayment,
  verifyPayemt,
};
