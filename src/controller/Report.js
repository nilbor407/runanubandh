const { ErrorResponse, SuccessResponse } = require('../helper/response');
const Report = require('../models/Report');

function ReportProfile(req, res) {
  try {
    return Report.create(req.body).then(reportData => {
      return new SuccessResponse(res, { msg: 'Reported successfully' });
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
}

function GetReportProfiles(req, res) {
  Report.find()
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: 'No report found',
        });
      }
      return new SuccessResponse(res, data);
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
}

module.exports = { ReportProfile, GetReportProfiles };
