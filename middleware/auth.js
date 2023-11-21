const jwt = require("jsonwebtoken");

const { models } = require("../models");

module.exports.authenticate = async (req, res, next) => {
  const token = req.cookies.jwt_token;

  if (!token) {
    req.user = null;
    req.token = null;
    req.authMessage = "Not authorized, no token";
    req.isAuthenticated = () => {
      return false;
    };

    return next();
  }

  try {
    const tokenExist = await models.Token.findOne({
      where: { token },
    });

    if (!tokenExist) {
      req.user = null;
      req.token = token;
      req.authMessage = "Not authorized, token rejected";
      req.isAuthenticated = () => {
        return false;
      };

      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        console.error("jwt verify error: ", error);

        req.user = null;
        req.token = token;
        req.authMessage = "Not authorized, token failed";
        req.isAuthenticated = () => {
          return false;
        };

        return next();
      }

      try {
        const user = await models.User.findOne({
          where: { user_id: decoded.userId },
        });

        if (!user) {
          throw new Error();
        }

        req.user = user;
        req.token = token;
        req.authMessage = "Authenticated";
        req.isAuthenticated = () => {
          return true;
        };

        return next();
      } catch (error) {
        req.user = null;
        req.token = token;
        req.authMessage = "Not authorized, Something went wrong";
        req.isAuthenticated = () => {
          return false;
        };

        return next();
      }
    });
  } catch (error) {
    req.user = null;
    req.token = token;
    req.authMessage = "Not authorized, Something went wrong";
    req.isAuthenticated = () => {
      return false;
    };

    return next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  const origin = req.originalUrl;
  const redirect = `/user/login${origin !== "/" ? "?redirect=" + origin : ""}`;

  if (!req.isAuthenticated()) {
    return res.redirect(redirect);
  }

  next();
};

module.exports.isNotLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
};

module.exports.auth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    throw new ErrorResponse(req.authMessage, 401);
  }

  next();
};
