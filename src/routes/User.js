const express = require('express');
const User = require('../controller/User');
const PhonePay = require('../controller/PhonePay');
const { Verify } = require('../middleware/VerifyToken');

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
router.post('/changeForgotPassword', User.changeForgotPassword);
router.post('/makePayment', PhonePay.makePayment);
router.get('/verifyPayment', PhonePay.verifyPayemt);

module.exports = router;
