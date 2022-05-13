const config = process.env;
const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
      return res.status(403).send("A token is required for authentication");
  }
  try{
        const decoded = await jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
  }catch (err) {
        return res.status(401).send("Invalid Token, login again");
  }
  return next();
};

module.exports = verifyToken;