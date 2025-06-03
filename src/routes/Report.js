const { Verify } = require('../middleware/VerifyToken');
const Report = require('../controller/Report');
const express = require('express');
const router = express.Router();

router.post('/create', Verify, Report.ReportProfile);
router.get('/fetch', Verify, Report.GetReportProfiles);

module.exports = router;
