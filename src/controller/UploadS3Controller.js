const AWS = require('aws-sdk');
const sharp = require('sharp');
const fileUpload = require('express-fileupload');
const path = require('path');

const uploadS3 = async (req, res) => {
  try {

    if (req?.files && req.files.profilePhoto) 
    {
      const file = req.files.profilePhoto;
      var filename = "uploads/"+Date.now() + path.extname(file.name);
      req.files.profilePhoto.mv("public/"+filename);
      res.send({
          response_code: 200,
          response_message: 'Success',
          response_data: {
            url: "http://localhost:8085/"+filename,
          },
        });


        
      //This convets the Image into webp
      // const data = await sharp(file.data).webp({
      //   quality: 60,
      // });
      // const fileExtension = data.options.formatOut;
      
      // const randomName = (Math.random() + 1).toString(36).substring(7);
      // // Setting up S3 upload parameters
      // const params = {
      //   Bucket: 'whitethread',
      //   Key: 'matrimony/profile/' + randomName + '.' + fileExtension, // File name you want to save as in S3
      //   Body: data,
      //   ContentType: 'image/webp',
      //   ACL: 'public-read',
      // };
      // s3.upload(params, function (err, data) {
      //   if (err) {
      //     throw err;
      //   }
      //   res.send({
      //     response_code: 200,
      //     response_message: 'Success',
      //     response_data: {
      //       url: data?.Location,
      //     },
      //   });
      // });
    }

    if (req?.files && req.files.document) {
      const file = req.files.document;
      var filename = "uploads/"+Date.now() + path.extname(file.name);
      req.files.document.mv("public/"+filename);
      res.send({
          response_code: 200,
          response_message: 'Success',
          response_data: {
            url: "http://localhost:8085/"+filename,
          },
        });
    }

    // if (req?.files && req.files.document) {
    //   const file = req.files.document;
    //   const s3 = new AWS.S3();
    //   const randomName = (Math.random() + 1).toString(36).substring(7);
    //   // // Setting up S3 upload parameters
    //   const params = {
    //     Bucket: 'whitethread',
    //     Key: 'matrimony/docs/' + randomName + path.extname(file.name), // File name you want to save as in S3
    //     Body: file.data,
    //     ContentType: file.mimetype,
    //     ACL: 'public-read',
    //   };
    //   s3.upload(params, function (err, data) {
    //     if (err) {
    //       throw err;
    //     }
    //     res.send({
    //       response_code: 200,
    //       response_message: 'Success',
    //       response_data: {
    //         url: data?.Location,
    //       },
    //     });
    //   });
    // }
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
