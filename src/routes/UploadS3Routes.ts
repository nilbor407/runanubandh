import UploadS3Controller from '../controller/UploadS3Controller';

import express from 'express';
const router = express.Router();

router.post('/', UploadS3Controller.uploadS3);

export default router;
