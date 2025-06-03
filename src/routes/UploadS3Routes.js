const UploadS3Controller = require('../controller/UploadS3Controller');
const express = require('express');
const router = express.Router();

router.post('/', UploadS3Controller.uploadS3);

module.exports = router;
