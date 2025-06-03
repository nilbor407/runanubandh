const express = require('express');
const Admin = require('../controller/Admin');
const { Verify } = require('../middleware/VerifyAdmin');

const router = express.Router();

router.post('/login', Admin.login);
router.post('/users', Verify, Admin.fetProfiles);
router.post('/user/delete', Verify, Admin.deleteUserProfile);
router.post('/user/update', Verify, Admin.updateUser);
router.get('/user/getDashboard', Verify, Admin.getDashboardData);

module.exports = router;
