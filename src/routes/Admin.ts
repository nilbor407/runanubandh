import express from 'express';
import Admin from '../controller/Admin';
import { Verify } from '../middleware/VerifyAdmin';

const router = express.Router();

router.post('/login', Admin.login);
router.post('/users', Verify, Admin.fetProfiles);
router.post('/user/delete', Verify, Admin.deleteUserProfile);
router.post('/user/update', Verify, Admin.updateUser);
router.get('/user/getDashboard', Verify, Admin.getDashboardData);

export default router;
