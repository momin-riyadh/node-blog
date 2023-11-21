const bcrypt = require("bcryptjs");

const { models, Sequelize } = require("../../models");
const generateAuthToken = require("../../utilities/generateAuthToken");
const { isEmail, isStrongPassword } = require("../../utilities/validator");
const ErrorResponse = require("../../utilities/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");

module.exports.postUserRegister = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

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
    throw new ErrorResponse("User validation failed", 400, { errors });
  }

  const existingUser = await models.User.findOne({ where: { email } });

  if (existingUser) {
    throw new ErrorResponse(
      "User already exists. Please choose a different one.",
      409
    );
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

  res.status(201).send({
    userId: newUser.user_id,
    firstName: newUser.first_name,
    lastName: newUser.last_name,
    fullName: newUser.full_name,
    email: newUser.email,
    role: newUser.role,
    token,
  });
});

module.exports.postUserLogin = asyncHandler(async (req, res) => {
  const { email, password: enteredPassword } = req.body;

  // VALIDATION
  let errors = {};
  if (!email) {
    errors.email = "Email field is required";
  }
  if (!enteredPassword) {
    errors.password = "Password field is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new ErrorResponse("Please fill in missing fields", 400, { errors });
  }

  const user = await models.User.findOne({ where: { email } });

  if (!user) {
    throw new ErrorResponse("Invalid email or password", 400);
  }

  const isMatch = await bcrypt.compare(enteredPassword, user.hash_password);

  if (!isMatch) {
    throw new ErrorResponse("Invalid email or password", 400);
  }

  const token = generateAuthToken(user.user_id);
  await models.Token.create({ user_id: user.user_id, token });

  res.cookie("jwt_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(201).send({
    userId: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    token,
  });
});

module.exports.postUserLogout = asyncHandler(async (req, res) => {
  await models.Token.destroy({
    where: {
      token: req.token,
    },
  });

  res.cookie("jwt_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(204).send({ message: "Successfuly logout" });
});
