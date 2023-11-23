const express = require("express");

const { models } = require("../../models");

const router = new express.Router();

router.get("/user/test", (req, res) => {
  res.send({ message: "Test success" });
});

module.exports = router;
