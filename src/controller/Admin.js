const jwt = require('jsonwebtoken');
const { JWTAdminScreatKey } = require('../common/Constants');
const { ErrorResponse, SuccessResponse } = require('../helper/response');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { errorMessage } = require('../common/StatusCodes');
const moment = require('moment');

const todayStart = moment().startOf('day').toDate();
const todayEnd = moment().endOf('day').toDate();

const login = (req, res) => {
  try {
    return Admin.find({
      mobileNumber: req.body?.mobileNumber,
      password: req?.body?.password,
    }).then((AdminData) => {
      if (AdminData.length <= 0) {
        return new ErrorResponse(res, {
          message: 'User not found',
        });
      } else {
        const id = AdminData[0]._id.toString();

        const jwtData = {
          userId: id,
          time: Date(),
        };

        const token = jwt.sign(jwtData, JWTAdminScreatKey);

        return Admin.findOneAndUpdate(
          {
            _id: AdminData[0]._id.toString(),
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
      }
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const fetProfiles = (req, res) => {
  const { gender, marriageStatus, fullName, age, income, page, status } = req.body;
  const splitAge = age?.split('-') ?? null;
  const incomeRange = income?.split('-') ?? null;

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
    status: status ? status : 'ACTIVE',
    photoDetails: { $exists: true },
  };

  const pagination_count = 10;

  try {
    User.find(filter, {
      userDetails: 1,
      mobileNumber: 1,
      email: 1,
      photoDetails: 1,
      age: 1,
      status: 1,
    })
      .sort({ createdAt: -1 })
      .limit(pagination_count)
      .skip(pagination_count * page)
      .then((userData) => {
        if (userData.length <= 0) {
          return new ErrorResponse(res, {
            message: 'No user found',
          });
        } else {
          return new SuccessResponse(res, { count: userData.length, userData });
        }
      });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const deleteUserProfile = (req, res) => {
  User.findByIdAndDelete({
    _id: req?.body?.userId,
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

const updateUser = (req, res) => {
  User.findOneAndUpdate(
    {
      mobileNumber: req?.body?.mobileNumber,
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

const getDashboardData = async (req, res) => {
  User.aggregate([
    {
      $facet: {
        totalUsers: [
          { $match: { photoDetails: { $exists: true } } },
          { $count: 'count' },
        ],
        totalIncome: [
          { $match: { photoDetails: { $exists: true } } },
          {
            $group: { _id: null, totalAmount: { $sum: '$orderInfo.amount' } },
          },
        ],
        totalUsersToday: [
          {
            $match: {
              createdAt: { $gte: todayStart, $lt: todayEnd },
              photoDetails: { $exists: true },
            },
          },
          { $count: 'count' },
        ],
        totalIncomeToday: [
          {
            $match: {
              createdAt: { $gte: todayStart, $lt: todayEnd },
              photoDetails: { $exists: true },
            },
          },
          {
            $group: { _id: null, totalAmount: { $sum: '$orderInfo.amount' } },
          },
        ],
        totalActiveUsers: [
          { $match: { status: 'ACTIVE', photoDetails: { $exists: true } } },
          { $count: 'count' },
        ],
        totalPendingUsers: [
          { $match: { status: 'PENDING', photoDetails: { $exists: true } } },
          { $count: 'count' },
        ],
      },
    },
  ])
    .then(result => {
      if (result === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }

      const totalUsers = result[0].totalUsers[0]
        ? result[0].totalUsers[0].count
        : 0;
      const totalIncome = result[0].totalIncome[0]
        ? result[0].totalIncome[0].totalAmount
        : 0;
      const totalUsersToday = result[0].totalUsersToday[0]
        ? result[0].totalUsersToday[0].count
        : 0;
      const totalIncomeToday = result[0].totalIncomeToday[0]
        ? result[0].totalIncomeToday[0].totalAmount
        : 0;
      const totalActiveUsers = result[0].totalActiveUsers[0]
        ? result[0].totalActiveUsers[0].count
        : 0;
      const totalPendingUsers = result[0].totalPendingUsers[0]
        ? result[0].totalPendingUsers[0].count
        : 0;

      return new SuccessResponse(res, {
        totalUsers,
        totalIncome: totalIncome / 100,
        totalUsersToday,
        totalIncomeToday: totalIncomeToday / 100,
        totalActiveUsers,
        totalPendingUsers,
      });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

module.exports = {
  login,
  fetProfiles,
  deleteUserProfile,
  updateUser,
  getDashboardData,
};
