import { ObjectId } from 'mongoose';

export type AdminType = {
  _id?: ObjectId;
  mobileNumber: string;
  password: string;
  token: string;
};
