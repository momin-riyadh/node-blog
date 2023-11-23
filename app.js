require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");

const db = require("./models");
const { notFound, errorHandler } = require("./middleware/error");
const { authenticate } = require("./middleware/auth");

const port = process.env.PORT || 8080;

// INITIATE EXPRESS APP
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

db.sequelize.sync({ alter: true }).then((conn) => {
  console.log("yes re-sync done!");

  console.log(
    `Connected to: ${conn.config.host}, "${conn.config.database}" database on PORT ${conn.config.port} `
  );
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(authenticate);

// SEND DATA TO LOCAL FOR ALL ROUTE
app.use("*", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  } else {
    res.locals.user = null;
    next();
  }
});

app.use(require("./routes"));

app.use(require("./routes/user"));
app.use("/api", require("./routes/user/api"));

app.use(require("./routes/post/"));
app.use("/api", require("./routes/post/api"));

app.use("/api/*", notFound); // for api route
app.use("/api/*", errorHandler); // for api route

// NOT FOUND PAGE
app.use("*", (req, res) => {
  res.status(404).render("not-found", { url: req.originalUrl });
});

app.listen(port, () =>
  console.log(
    `Server running on PORT ${port}\nLocal:\thttp://localhost:${port}`
  )
);
