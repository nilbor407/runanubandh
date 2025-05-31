import express from 'express';
import Razorpay from 'razorpay';
import {
  JWTScreatKey,
  RazorpayKeyId,
  RazorpayKeySecreat,
} from '../common/Constants';
import User from '../models/User';
import { ErrorResponse } from '../helper/response';
import { errorMessage } from '../common/StatusCodes';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/order', async (req, res) => {
  const razorpay = new Razorpay({
    key_id: RazorpayKeyId,
    key_secret: RazorpayKeySecreat,
  });

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: req.body.id,
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);

    const id = req.body.id;

    return User.findById(id)
      .then(data => {
        if (data === null) {
          return new ErrorResponse(res, {
            message: errorMessage.USER_NOT_FOUND,
          });
        }

        data?.set({
          orderInfo: {
            orderId: response.id,
            currency: response.currency,
            amount: response.amount,
          },
        });
        data
          ?.save()
          .then(data2 => {
            return res.json({
              order_id: response.id,
              currency: response.currency,
              amount: response.amount,
              id,
            });
          })
          .catch(error => {
            return new ErrorResponse(res, error.message);
          });
      })
      .catch(error => {
        return new ErrorResponse(res, error.message);
      });
  } catch (err) {
    res.status(400).send('Not able to create order. Please try again!');
  }
});

router.post('/payment', (req, res) => {
  const jwtData = {
    userId: req?.body?.id,
    time: Date(),
  };
  const token = jwt.sign(jwtData, JWTScreatKey);
  User.findOneAndUpdate(
    {
      'orderInfo.orderId': req?.body?.orderDetails?.orderId,
    },
    { paymentInfo: req.body, token },
    { new: true },
  )
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }
      const redirectUrl = `/validate?orderId=${
        data?.paymentInfo?.orderDetails?.orderId
      }&token=${data?.token}&type=${
        data?.paymentInfo?.status === 'succeeded' ? 1 : 0
      }`;
      res.json({ redirect: redirectUrl });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
});

router.post('/orderdetails', (req, res) => {
  User.findOne({
    'orderInfo.orderId': req?.body?.orderId,
  })
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }
      res.json({ data });
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
});

export default router;
