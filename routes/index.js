const express = require("express");

const { models, Sequelize } = require("../models");

const router = new express.Router();

router.get("/", (req, res) => {
  res.render("home");
});

module.exports = router;
