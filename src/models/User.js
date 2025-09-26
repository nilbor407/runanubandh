const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = new mongoose.Schema(
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
    paymentInfo: {
      type: Object,
      default: null,
      // Add explicit structure to ensure consistent saving
      validate: {
        validator: function (v) {
          // Allow null/undefined or proper object structure
          if (!v) return true;
          return typeof v === 'object';
        },
        message: 'Payment info must be an object'
      }
    },
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
    // Ensure strict mode for better data integrity
    strict: true,
    // Add pre-save middleware for debugging
  },
);

// Add pre-save middleware to log payment info updates
UserSchema.pre('save', function (next) {
  if (this.isModified('paymentInfo')) {
    console.log('💾 User schema: paymentInfo being saved for user:', this._id);
    console.log('💾 Payment info data:', this.paymentInfo);
  }
  next();
});

// Add post-save middleware to confirm save
UserSchema.post('save', function (doc, next) {
  if (doc.paymentInfo) {
    console.log('✅ User schema: paymentInfo successfully saved for user:', doc._id);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
