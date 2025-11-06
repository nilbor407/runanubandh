const express = require('express');
const User = require('../controller/User');
const PhonePay = require('../controller/PhonePay');
const { Verify } = require('../middleware/VerifyToken');
const { logPaymentRequest } = require('../middleware/PaymentLogger');

const router = express.Router();

router.post('/create', User.createNewUser);
router.post('/login', User.login);
router.get('/info', Verify, User.getUserInfo);
router.post('/updateUser', Verify, User.updateUser);
router.post('/getProfile', Verify, User.fetProfiles);
router.post('/changePassword', Verify, User.changePassword);
router.post('/deleteUserProfile', User.deleteUserProfile);
router.post('/checkEmail', User.checkEmail);
router.post('/verifyOTP', User.verifyOTP);
router.get('/view_aadhaar', User.viewAadhaar); // Make route match frontend

router.post('/update_aadhaar', User.updateAadhaar);

router.post('/changeForgotPassword', User.changeForgotPassword);

// Add logging middleware for payment-related routes
router.post('/makePayment', logPaymentRequest, PhonePay.makePayment);
router.get('/verifyPayment', logPaymentRequest, PhonePay.verifyPayemt);

module.exports = router;
