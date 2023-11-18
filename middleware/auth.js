const jwt = require("jsonwebtoken");

const { models } = require("../models");

module.exports.authenticate = async (req, res, next) => {
  const token = req.cookies.jwt_token;

  if (!token) {
    req.user = null;
    req.token = null;
    req.isAuthenticated = () => {
      return false;
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await models.User.findOne({
      where: { user_id: decoded.userId },
    });

    const tokenExist = await models.Token.findOne({
      where: { token },
    });

    if (!user || !tokenExist) {
      throw new Error();
    }

    req.isAuthenticated = () => {
      return true;
    };
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    req.user = null;
    req.token = token;
    req.isAuthenticated = () => {
      return false;
    };
    return next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  const origin = req.originalUrl;
  const redirect = `/user/login${origin !== "/" ? "?redirect=" + origin : ""}`;

  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect(redirect);
};
