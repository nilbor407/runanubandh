const jwt = require('jsonwebtoken');
const { JWTScreatKey } = require('../common/Constants');

const Verify = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({
      status: 'failed',
      message: 'A token is required for authentication',
    });
  }
  try {
    const decoded = jwt.verify(token, JWTScreatKey);
    req.params.userId = decoded.userId;
  } catch (err) {
    return res.status(401).send({
      status: 'failed',
      message: 'Invalid Token',
    });
  }
  return next();
};

module.exports = { Verify };
