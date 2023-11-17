const express = require("express");

const { models, Sequelize } = require("../../models");
const generateAuthToken = require("../../utilities/generateAuthToken");
const { isEmail, isStrongPassword } = require("../../utilities/validator");

const router = new express.Router();

router.get("/user/register", (req, res) => {
  const redirect = req.query.redirect;
  const actionRoute = `/user/register${
    redirect ? "?redirect=" + redirect : ""
  }`;

  res.render("user/register", {
    actionRoute,
    errorMessage: "",
    errors: {},
    fields: { firstName: "", lastName: "", email: "", password: "" },
  });
});

router.post("/user/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const redirect = req.query.redirect;
  const actionRoute = `/user/register${
    redirect ? "?redirect=" + redirect : ""
  }`;

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
      actionRoute,
      errorMessage: "User validation failed",
      errors,
      fields: { firstName, lastName, email, password },
    });
  }

  try {
    const existingUser = await models.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).render("user/register", {
        actionRoute,
        errorMessage: "User already exists. Please choose a different one.",
        errors,
        fields: { firstName, lastName, email, password },
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

    res.redirect(redirect || "/");
  } catch (error) {
    res.status(500).render("user/register", {
      actionRoute,
      errorMessage: "Something went wrong",
      errors,
      fields: { firstName, lastName, email, password },
    });
  }
});

module.exports = router;
