import { httpStatusCodes } from '../common/StatusCodes';

export class SuccessResponse {
  public response: any;

  constructor(res: any, data: any) {
    this.response = data;
    res.status(httpStatusCodes.OK).json({
      success: 1,
      data: this.response,
    });
  }
}

export class ErrorResponse {
  public response: any;

  constructor(res: any, data: any) {
    this.response = data;
    res.status(httpStatusCodes.OK).json({ success: 0, data: this.response });
  }
}
