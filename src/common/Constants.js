const JWTScreatKey = 'Vaibhav@123#123';
const JWTAdminScreatKey = 'VaibhavAdmin@123#123';
const RazorpayKeyId = 'rzp_test_zXvhTnlKdx8mfz';
const RazorpayKeySecreat = 'DaxxNwrL4Yc2L0P8g1u4617H';

//PhonePay
const salt_key = ''; // add salt key which is available in the PhonePay dashboard
const merchant_id = ''; // add merchant_id which is available in the PhonePay dashboard
const subscriptionAmount = 501;
const payemntRedirectUrl = 'http://localhost:8085/user/verifyPayment';
const frontendPaymentRedirectURL = 'https://runanubandhvishwavivah.com/';

module.exports = {
  JWTScreatKey,
  JWTAdminScreatKey,
  RazorpayKeyId,
  RazorpayKeySecreat,
  salt_key,
  merchant_id,
  subscriptionAmount,
  payemntRedirectUrl,
  frontendPaymentRedirectURL,
};
