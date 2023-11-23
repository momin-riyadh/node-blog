const express = require("express");

const { auth } = require("../../middleware/auth");
const userApiControllers = require("../../controllers/user/api");

const router = new express.Router();

router.post("/user/register", userApiControllers.postUserRegister);
router.post("/user/login", userApiControllers.postUserLogin);
router.post("/user/logout", auth, userApiControllers.postUserLogout);

module.exports = router;
