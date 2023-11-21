const bcrypt = require("bcryptjs");

const { models, Sequelize } = require("../../models");
const generateAuthToken = require("../../utilities/generateAuthToken");
const { isEmail, isStrongPassword } = require("../../utilities/validator");

module.exports.getUserRegister = (req, res) => {
  const origin = req.query.redirect;
  const redirect = origin ? "?redirect=" + origin : "";

  res.render("user/register", {
    redirect,
    errorMessage: "",
    errors: {},
    values: { firstName: "", lastName: "", email: "", password: "" },
  });
};

module.exports.postUserRegister = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const origin = req.query.redirect;
  const redirect = origin ? "?redirect=" + origin : "";

  // VALIDATION
  let errors = {};

  if (!firstName) {
    errors.firstName = "First name field is required";
  }
  if (!lastName) {
    errors.lastName = "Last name field is required";
  }
  if (!email) {
    errors.email = "Email field is required";
  }
  if (!password) {
    errors.password = "Password field is required";
  }

  if (email && !isEmail(email)) {
    errors.email = "Your entered email is not valid";
  }
  if (password && !isStrongPassword(password)) {
    errors.password =
      "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and no spaces.";
  }
  if (password && password.length < 8) {
    errors.password = "Password is too short. Minimum length is 8 characters";
  }
  if (password && password.length > 15) {
    errors.password = "Password is too long. Maximum length is 16 characters";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("user/register", {
      redirect,
      errorMessage: "User validation failed",
      errors,
      values: { firstName, lastName, email, password },
    });
  }

  try {
    const existingUser = await models.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).render("user/register", {
        redirect,
        errorMessage: "User already exists. Please choose a different one",
        errors,
        values: { firstName, lastName, email, password },
      });
    }

    const newUser = await models.User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });

    const token = generateAuthToken(newUser.user_id);
    await models.Token.create({ user_id: newUser.user_id, token });

    res.cookie("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(origin || "/");
  } catch (error) {
    res.status(500).render("user/register", {
      redirect,
      errorMessage: "Something went wrong",
      errors,
      values: { firstName, lastName, email, password },
    });
  }
};

module.exports.getUserLogin = (req, res) => {
  const origin = req.query.redirect;
  const redirect = origin ? "?redirect=" + origin : "";

  res.render("user/login", {
    redirect,
    errorMessage: "",
    errors: {},
    values: { email: "", password: "" },
  });
};

module.exports.postUserLogin = async (req, res) => {
  const { email, password: enteredPassword } = req.body;

  const origin = req.query.redirect;
  const redirect = origin ? "?redirect=" + origin : "";

  // VALIDATION
  let errors = {};
  if (!email) {
    errors.email = "Email field is required";
  }
  if (!enteredPassword) {
    errors.password = "Password field is required";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("user/login", {
      redirect,
      errorMessage: "Please fill in missing fields",
      errors,
      values: { email, password: enteredPassword },
    });
  }

  try {
    const user = await models.User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).render("user/login", {
        redirect,
        errorMessage: "Invalid email or password",
        errors,
        values: { email, password: enteredPassword },
      });
    }

    const isMatch = await bcrypt.compare(enteredPassword, user.hash_password);

    if (!isMatch) {
      return res.status(400).render("user/login", {
        redirect,
        errorMessage: "Invalid email or password",
        errors,
        values: { email, password: enteredPassword },
      });
    }

    const token = generateAuthToken(user.user_id);
    await models.Token.create({ user_id: user.user_id, token });

    res.cookie("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(origin || "/");
  } catch (error) {
    res.status(500).render("user/login", {
      redirect,
      errorMessage: "Something went wrong",
      errors,
      values: { email, password: enteredPassword },
    });
  }
};

module.exports.getUserprofile = (req, res) => {
  res.render("user/profile");
};
