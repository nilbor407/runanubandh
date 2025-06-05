const axios = require('axios');
const crypto = require('crypto');
const {
  salt_key,
  merchant_id,
  subscriptionAmount,
  payemntRedirectUrl,
  JWTScreatKey,
  frontendPaymentRedirectURL,
} = require('../common/Constants');
const { ErrorResponse } = require('../helper/response');
const { errorMessage } = require('../common/StatusCodes');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const makePayment = async (req, res) => {
  console.log('makePayment called');
  try {
    let { transactionId, userId } = req.body;
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: transactionId,
      name: req.body.name,
      amount: subscriptionAmount * 100,
      redirectUrl: `${payemntRedirectUrl}?id=${transactionId}&userId=${userId}`,
      redirectMode: 'GET',
      mobileNumber: req.body.phone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };
    console.log(data);
    return;
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
    const prod_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
    // const prod_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
    const options = {
      method: 'POST',
      url: prod_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: payloadMain,
      },
    };
    await axios(options)
      .then(function (response) {
        return res.json(response.data);
      })
      .catch(function (error) {
        console.log('ghhhhhhhhhhhhhhhhhhh', error);
      });
  } catch (error) {
    console.log('kkkkkkkkkkkkkk', error);
  }
};

const verifyPayemt = async (req, res) => {
  const { id, userId } = req.query;
  const merchantId = merchant_id;
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${id}` + salt_key;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;
  const options = {
    method: 'GET',
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${id}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': `${merchantId}`,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      if (
        response.data.success === true &&
        response.data.code === 'PAYMENT_SUCCESS'
      ) {
        verifyPaymentSuccess({ userId, paymentInfo: response.data, req, res });
      } else {
        const url = `${frontendPaymentRedirectURL}/fail`;
        return res.redirect(url);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

const verifyPaymentSuccess = ({ userId, paymentInfo, req, res }) => {
  const jwtData = {
    userId,
    time: Date(),
  };
  const token = jwt.sign(jwtData, JWTScreatKey);
  User.findOneAndUpdate(
    {
      _id: userId,
    },
    { paymentInfo, token },
    { new: true },
  )
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }
      const redirectUrl = `${frontendPaymentRedirectURL}/validate?token=${
        data?.token
      }&type=${paymentInfo.code === 'PAYMENT_SUCCESS' ? 1 : 0}`;
      return res.redirect(redirectUrl);
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

module.exports = {
  makePayment,
  verifyPayemt,
};
