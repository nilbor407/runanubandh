import { Schema, model } from 'mongoose';
import { AdminType } from '../namespace/Admin';

const AdminSchema = new Schema<AdminType>(
  {
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    token: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Admin = model<AdminType>('Admin', AdminSchema);

export default Admin;
