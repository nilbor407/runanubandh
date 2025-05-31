import { Schema, model } from 'mongoose';
import { ReportType } from '../namespace/Report';

const ReportSchema = new Schema<ReportType>(
  {
    reportedUserId: { type: String, required: true },
    reportingUserId: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Report = model<ReportType>('Report', ReportSchema);

export default Report;
