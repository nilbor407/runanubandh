import { Verify } from '../middleware/VerifyToken';
import Report from '../controller/Report';
import express from 'express';

const router = express.Router();

router.post('/create', Verify, Report.ReportProfile);
router.get('/fetch', Verify, Report.GetReportProfiles);

export default router;
