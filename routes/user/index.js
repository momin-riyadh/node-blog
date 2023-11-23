const express = require("express");

const userControllers = require("../../controllers/user");
const { isLoggedIn, isNotLoggedIn } = require("../../middleware/auth");

const router = new express.Router();

router.get("/user/register", isNotLoggedIn, userControllers.getUserRegister);

router.post("/user/register", isNotLoggedIn, userControllers.postUserRegister);

router.get("/user/login", isNotLoggedIn, userControllers.getUserLogin);

router.post("/user/login", isNotLoggedIn, userControllers.postUserLogin);

router.get("/user/profile", isLoggedIn, userControllers.getUserprofile);

module.exports = router;
