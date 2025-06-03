const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
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

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
