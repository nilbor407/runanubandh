import { Schema, model } from 'mongoose';
import { UserType } from '../namespace/User';
import moment from 'moment';

const UserSchema = new Schema<UserType>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    age: { type: Number },
    userDetails: {
      basicDetails: { type: Object },
      personalDetails: { type: Object },
      familyDetails: { type: Object },
      addressDetails: { type: Object },
      partnerpreferences: { type: Object },
    },
    photoDetails: { type: Object },
    paymentInfo: { type: Object },
    orderInfo: { type: Object },
    subscriptionStartDate: {
      type: String,
      default: moment().format('yyyy-MM-DD:HH:mm:ss'),
    },
    subscriptionEndDate: {
      type: String,
      default: moment().add(1, 'year').format('yyyy-MM-DD:HH:mm:ss'),
    },
    token: { type: String },
    status: { type: String, default: 'ACTIVE' },
    otp: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = model<UserType>('User', UserSchema);

export default User;
