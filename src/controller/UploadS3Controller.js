const AWS = require('aws-sdk');
const sharp = require('sharp');
const fileUpload = require('express-fileupload');
const path = require('path');

const uploadS3 = async (req, res) => {
  try {
    //LOAD AWS CONFIG
    AWS.config.update({
      accessKeyId: 'AKIAVCRUJTN4L6YCIJ6G',
      secretAccessKey: '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',
      region: 'us-east-1',
    });

    if (req?.files && req.files.profilePhoto) {
      const file = req.files.profilePhoto;
      //This convets the Image into webp
      const data = await sharp(file.data).webp({
        quality: 60,
      });
      const fileExtension = data.options.formatOut;
      const s3 = new AWS.S3();
      const randomName = (Math.random() + 1).toString(36).substring(7);
      // Setting up S3 upload parameters
      const params = {
        Bucket: 'whitethread',
        Key: 'matrimony/profile/' + randomName + '.' + fileExtension, // File name you want to save as in S3
        Body: data,
        ContentType: 'image/webp',
        ACL: 'public-read',
      };
      s3.upload(params, function (err, data) {
        if (err) {
          throw err;
        }
        res.send({
          response_code: 200,
          response_message: 'Success',
          response_data: {
            url: data?.Location,
          },
        });
      });
    }

    if (req?.files && req.files.document) {
      const file = req.files.document;
      const s3 = new AWS.S3();
      const randomName = (Math.random() + 1).toString(36).substring(7);
      // // Setting up S3 upload parameters
      const params = {
        Bucket: 'whitethread',
        Key: 'matrimony/docs/' + randomName + path.extname(file.name), // File name you want to save as in S3
        Body: file.data,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };
      s3.upload(params, function (err, data) {
        if (err) {
          throw err;
        }
        res.send({
          response_code: 200,
          response_message: 'Success',
          response_data: {
            url: data?.Location,
          },
        });
      });
    }
  } catch (error) {
    res.status(404).json({
      message: 'error',
      data: { error },
    });
  }
};

module.exports = {
  uploadS3,
};
