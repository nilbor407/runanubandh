const { httpStatusCodes } = require('../common/StatusCodes');

class SuccessResponse {
  constructor(res, data) {
    res.status(httpStatusCodes.OK).json({
      success: 1,
      data: data,
    });
  }
}

class ErrorResponse {
  constructor(res, data) {
    res.status(httpStatusCodes.OK).json({ success: 0, data: data });
  }
}

module.exports = { SuccessResponse, ErrorResponse };
