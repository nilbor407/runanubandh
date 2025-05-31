import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTScreatKey } from '../common/Constants';
import { JWTResponse } from '../namespace/User';

export const Verify = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({
      status: 'failed',
      message: 'A token is required for authentication',
    });
  }
  try {
    const { userId } = jwt.verify(token, JWTScreatKey) as JWTResponse;
    req.params.userId = userId;
  } catch (err) {
    return res.status(401).send({
      status: 'failed',
      message: 'Invalid Token',
    });
  }
  return next();
};
