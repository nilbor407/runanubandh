const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWTScreatKey } = require('../common/Constants');
const { SuccessResponse, ErrorResponse } = require('../helper/response');
const { errorMessage } = require('../common/StatusCodes');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const createNewUser = (req, res) => {
  try {
    const { mobileNumber } = req.body;
    return User.find({ mobileNumber: mobileNumber }).then(userData => {
      if (userData.length > 0) {
        return new ErrorResponse(res, {
          message: 'User already exist !',
        });
      } else {
        const jwtData = {
          mobileNumber,
          time: Date(),
        };
        const token = jwt.sign(jwtData, JWTScreatKey);
        const datep = {
          ...req.body,
          token,
        };

        const user = new User(datep);
        return user
          .save()
          .then(data => {
            return new SuccessResponse(res, { token, id: data?.id });
          })
          .catch(error => {
            return new ErrorResponse(res, error.message);
          });
      }
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const updateUser = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req?.params?.userId,
    },
    req.body,
    { new: true },
  )
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }

      return new SuccessResponse(res, { data });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

const getUserInfo = (req, res) => {
  User.findOne({
    _id: req?.params?.userId,
  })
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }

      return new SuccessResponse(res, data);
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

const login = (req, res) => {
  try {
    // Ensure mobile number is treated as string
    const mobileNumber = req.body?.mobileNumber?.toString();
    const password = req.body?.password;

    console.log('Login attempt for mobile:', mobileNumber);

    if (!mobileNumber || !password) {
      console.log('Missing credentials - mobile:', !!mobileNumber, 'password:', !!password);
      return new ErrorResponse(res, {
        message: 'Mobile number and password are required',
      });
    }

    // Validate mobile number format
    if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
      console.log('Invalid mobile number format:', mobileNumber);
      return new ErrorResponse(res, {
        message: 'Mobile number must be exactly 10 digits',
      });
    }

    return User.find({
      mobileNumber: mobileNumber,
      password: password,
    }).then((userData) => {
      console.log('Users found with matching credentials:', userData.length);

      if (userData.length <= 0) {
        // Check if user exists with this mobile number but wrong password
        return User.find({ mobileNumber: mobileNumber }).then((userCheck) => {
          if (userCheck.length > 0) {
            console.log('User exists but wrong password');
            return new ErrorResponse(res, {
              message: 'Incorrect password',
            });
          } else {
            console.log('No user found with this mobile number');
            return new ErrorResponse(res, {
              message: 'No account found with this mobile number',
            });
          }
        });
      }

      // Comment out payment check for development - uncomment for production
      /*
      if (!userData[0]?.paymentInfo) {
        return new ErrorResponse(res, {
          message:
            'There seems to be an issue with your payment. Please reach out to our customer support for assistance.',
        });
      }
      */

      const id = userData[0]._id.toString();
      console.log('Login successful for user ID:', id);

      const jwtData = {
        userId: id,
        time: Date(),
      };

      const token = jwt.sign(jwtData, JWTScreatKey);

      return User.findOneAndUpdate(
        {
          _id: userData[0]._id.toString(),
        },
        {
          token,
        },
        {
          new: true,
        },
      ).then(data => {
        return new SuccessResponse(res, { token });
      })
        .catch(error => {
          console.error('Error updating user token:', error);
          return new ErrorResponse(res, error.message);
        });
    });
  } catch (error) {
    console.error('Login error:', error);
    return new ErrorResponse(res, {
      message: 'Internal server error during login'
    });
  }
};

const fetProfiles = (req, res) => {
  const { gender, marriageStatus, fullName, age, income, page } = req.body;
  const splitAge = age?.split('-') ?? null;
  const incomeRange = income?.split('-') ?? null;
  const pagination_count = 10;
  const filter = {
    ...(gender && { 'userDetails.personalDetails.gender': gender }),
    ...(marriageStatus && {
      'userDetails.personalDetails.marriageStatus': marriageStatus,
    }),
    ...(fullName && {
      'userDetails.personalDetails.fullName': { $regex: fullName },
    }),
    ...(splitAge && {
      age: {
        $gte: splitAge[0],
        $lte: splitAge[1],
      },
    }),
    ...(incomeRange && {
      'userDetails.basicDetails.income': {
        $gte: incomeRange[0],
        $lte: incomeRange[1],
      },
    }),
    status: 'ACTIVE',
  };

  try {
    return User.find(filter, {
      userDetails: 1,
      mobileNumber: 1,
      email: 1,
      photoDetails: 1,
      age: 1,
    })
      .sort({ createdAt: -1 })
      .limit(pagination_count * page)
      .then((userData) => {
        if (userData.length <= 0) {
          return new ErrorResponse(res, {
            message: 'No user found',
          });
        } else {
          return new SuccessResponse(res, {
            count: userData.length,
            userData,
          });
        }
      });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const changePassword = (req, res) => {
  User.findOne({
    _id: req?.params?.userId,
    password: req?.body?.oldPassword,
  })
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }

      return User.findOneAndUpdate(
        {
          _id: req?.params?.userId,
        },
        {
          password: req.body.newPassword,
        },
        {
          new: true,
        },
      )
        .then(data => {
          return new SuccessResponse(res, {
            msg: 'password updated successfully',
          });
        })
        .catch(error => {
          return new ErrorResponse(res, error.message);
        });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

const deleteUserProfile = (req, res) => {
  User.findByIdAndDelete({
    _id: req?.params?.userId,
  })
    .then(data => {
      return new SuccessResponse(res, {
        message: 'User Deleted Successfully',
      });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

function getOtpEmailTemplate(otp) {
  const templatePath = path.join(__dirname, 'otpTemplate.html'); // Ensure the path is correct
  let template = fs.readFileSync(templatePath, 'utf-8');
  return template.replace('{{OTP_CODE}}', otp);
}

const viewAadhaar = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ message: "Token not provided" });

    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Invalid or expired token" });

    const aadhaarData = {
      fullName: user.userDetails?.personalDetails?.fullName || "N/A",
      aadhaarFront: user.photoDetails?.adharCard || null,
      aadhaarBack: user.aadhaarBackImage || null,
      email: user.userDetails?.basicDetails?.height || null,
      photo: user.photoDetails?.profilePhoto || null,
    };

    return res.status(200).json({ aadhaarData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const updateAadhaar = async (req, res) => {
  try {
    const token = req.body.token;
    const file = req.files?.aadhaarFront;
    if (!token || !file) {
      return res.status(400).json({ message: "Token or file not provided" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Invalid or expired token" });

    // ✅ Upload folder (public/uploads)
    const uploadDir = path.join(__dirname, '../../public/uploads'); // project root चा public/uploads
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = Date.now() + '_' + file.name;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.data);

    // Absolute URL
    const serverDomain = "https://runanubandh.cloudjiffy.net";
    const absoluteUrl = `/uploads/${fileName}`;

    user.photoDetails = user.photoDetails || {};
    user.photoDetails.adharCard = absoluteUrl;
    user.markModified('photoDetails');
    await user.save();


    return res.status(200).json({
      message: "Aadhaar updated successfully",
      aadhaarData: {
        fullName: user.userDetails?.personalDetails?.fullName || "N/A",
        aadhaarFront: user.photoDetails.adharCard, // updated path
        photo: user.photoDetails?.profilePhoto || null,
      }
    });

  } catch (err) {
    console.error("Error updating Aadhaar:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};






// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,         
//   secure: false,     
//   auth: {
//     user: 'dattapadre7249@gmail.com',
//     pass: 'ibip cill mvek iypo', // make sure this is the SMTP password
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   logger: true,
//   debug: true,
// });



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "dattapadre7249@gmail.com",
    pass: "ibip cill mvek iypo",
  },
});


// giteaviraj155@gmail.com
// hxnq yrpq pzss deru'
const sendOtpEmail = (to, otp) => {
  const emailTemplate = getOtpEmailTemplate(otp);

  const mailOptions = {
    from: 'dattapadre7249@gmail.com ',
    to: to,
    subject: 'Your OTP Code',
    html: emailTemplate,
  };

  return transporter.sendMail(mailOptions);
};




const checkEmail = async (req, res) => 
{
  console.log('checkEmail called with email:', req.body?.email);
  try {
    const userData = await User.find({ email: req.body?.email });
    if (!userData.length) {
      return new ErrorResponse(res, { message: 'User not found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated OTP:', otp, req.body?.email);

    // Send OTP email
    console.log(req.body?.email, otp);
    try {
      await sendOtpEmail(req.body?.email, otp);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return new ErrorResponse(res, { message: 'Failed to send OTP email' });
    }

    // Save OTP in DB
    await User.findOneAndUpdate(
      { _id: userData[0]._id.toString() },
      { otp },
      { new: true }
    );

    console.log("email send Done....");

    return new SuccessResponse(res, { message: 'Otp sent Done' });

  } catch (error) {
    return new ErrorResponse(res, error.message);
  }
};


const verifyOTP = (req, res) => {
  try {
    return User.find({
      email: req.body?.email,
      otp: req?.body?.otp,
    }).then((userData) => {
      if (userData.length <= 0) {
        return new ErrorResponse(res, {
          valid: false,
        });
      } else {
        return new SuccessResponse(res, { valid: true });
      }
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const changeForgotPassword = (req, res) => {
  User.findOneAndUpdate(
    {
      email: req?.body?.email,
    },
    req.body,
    { new: true },
  )
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }

      return new SuccessResponse(res, {
        message: 'Password updated successfully',
      });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};


// ✅ Aadhaar view API
// exports.viewAadhaar = async (req, res) => {
//   try {
//     const token = req.query.token;
//     if (!token) return res.status(400).json({ message: "Token is required" });

//     const user = await User.findOne({ token });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.json({
//       aadhaarData: {
//         fullName: user.fullName,
//         aadhaarFront: user.aadhaarFront,
//         aadhaarBack: user.aadhaarBack,
//         aadhaarNumber: user.aadhaarNumber || "Not Provided",
//         photo: user.photo,
//       },
//     });
//   } catch (err) {
//     console.error("Error in viewAadhaar:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// ✅ Aadhaar update API


module.exports = {
  createNewUser,
  updateUser,
  getUserInfo,
  login,
  fetProfiles,
  changePassword,
  deleteUserProfile,
  checkEmail,
  verifyOTP,
  viewAadhaar,
  updateAadhaar,
  changeForgotPassword,
};
