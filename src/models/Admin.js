const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
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

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
