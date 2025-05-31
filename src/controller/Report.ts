import { Request, Response } from 'express';
import { ErrorResponse, SuccessResponse } from '../helper/response';
import Report from '../models/Report';

const ReportProfile: any = (req: Request, res: Response) => {
  try {
    return Report.create(req.body).then(reportData => {
      return new SuccessResponse(res, { msg: 'Reported successfully' });
    });
  } catch (error) {
    return new ErrorResponse(res, error);
  }
};

const GetReportProfiles: any = (req: Request, res: Response) => {
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
};

export default { ReportProfile, GetReportProfiles };
