import { UserType } from '../namespace/User';
import { SuccessResponse, ErrorResponse } from '../helper/response';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { JWTScreatKey } from '../common/Constants';
import { Request, Response } from 'express';
import { errorMessage } from '../common/StatusCodes';
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const createNewUser: any = (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body as unknown as UserType;
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

const updateUser: any = (req: Request, res: Response) => {
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

const getUserInfo: any = (req: Request, res: Response) => {
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

const login: any = (req: Request, res: Response) => {
  try {
    return User.find({
      mobileNumber: req.body?.mobileNumber,
      password: req?.body?.password,
    }).then((userData: UserType[]) => {
      if (userData.length <= 0) {
        return new ErrorResponse(res, {
          message: 'Incorrect Mobile Number or Password',
        });
      }

      if (!userData[0]?.paymentInfo) {
        return new ErrorResponse(res, {
          message:
            'There seems to be an issue with your payment. Please reach out to our customer support for assistance.',
        });
      }

      const id = userData[0]._id.toString();

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
      )
        .then(data => {
          return new SuccessResponse(res, { token });
        })
        .catch(error => {
          return new ErrorResponse(res, error.message);
        });
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const fetProfiles = (req: Request, res: Response) => {
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
      .then((userData: UserType[]) => {
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

const changePassword: any = (req: Request, res: Response) => {
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

const deleteUserProfile: any = (req: Request, res: Response) => {
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

function getOtpEmailTemplate(otp: any) {
  const templatePath = path.join(__dirname, 'otpTemplate.html'); // Ensure the path is correct
  let template = fs.readFileSync(templatePath, 'utf-8');
  return template.replace('{{OTP_CODE}}', otp);
}

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465, // 465 for secure connections (SSL/TLS)
  secure: true, // Use SSL/TLS
  auth: {
    user: 'info@sakalvishwavivah.com', // Your GoDaddy email
    pass: 'Admin@123#123', // Your GoDaddy email password
  },
});

const sendOtpEmail = (to: any, otp: any) => {
  const emailTemplate = getOtpEmailTemplate(otp);

  const mailOptions = {
    from: 'Sakal Vishwa Vivah <info@sakalvishwavivah.com>',
    to: to,
    subject: 'Your OTP Code',
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error: any, info: { messageId: any }) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
};

const checkEmail: any = (req: Request, res: Response) => {
  try {
    return User.find({
      email: req.body?.email,
    }).then((userData: UserType[]) => {
      if (userData.length <= 0) {
        return new ErrorResponse(res, {
          message: 'User not found',
        });
      } else {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        sendOtpEmail(req.body?.email, otp);

        return User.findOneAndUpdate(
          {
            _id: userData[0]._id.toString(),
          },
          {
            otp,
          },
          {
            new: true,
          },
        )
          .then(data => {
            return new SuccessResponse(res, { message: 'Otp sent' });
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

const verifyOTP: any = (req: Request, res: Response) => {
  try {
    return User.find({
      email: req.body?.email,
      otp: req?.body?.otp,
    }).then((userData: UserType[]) => {
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

const changeForgotPassword: any = (req: Request, res: Response) => {
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

export default {
  createNewUser,
  updateUser,
  getUserInfo,
  login,
  fetProfiles,
  changePassword,
  deleteUserProfile,
  checkEmail,
  verifyOTP,
  changeForgotPassword,
};
