import { Verify } from '../middleware/VerifyToken';
import User from '../controller/User';
import PhonePay from '../controller/PhonePay';
import express from 'express';

const router = express.Router();

router.post('/create', User.createNewUser);
router.post('/login', User.login);
router.get('/info', Verify, User.getUserInfo);
router.post('/updateUser', Verify, User.updateUser);
router.post('/getProfile', Verify, User.fetProfiles);
router.post('/changePassword', Verify, User.changePassword);
router.post('/deleteUserProfile', Verify, User.deleteUserProfile);
router.post('/checkEmail', User.checkEmail);
router.post('/verifyOTP', User.verifyOTP);
router.post('/changeForgotPassword', User.changeForgotPassword);
router.post('/makePayment', PhonePay.makePayment);
router.get('/verifyPayment', PhonePay.verifyPayemt);

export default router;
