require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

const db = require("./models");

const port = process.env.PORT || 8080;

// INITIATE EXPRESS APP
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

db.sequelize.sync({ force: true }).then((conn) => {
  console.log("yes re-sync done!");

  console.log(
    `Connected to: ${conn.config.host}, "${conn.config.database}" database on PORT ${conn.config.port} `
  );
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(require("./routes"));

app.use(require("./routes/user"));
app.use("/api", require("./routes/user/api"));

app.use(require("./routes/post/"));
app.use("/api", require("./routes/post/api"));

app.get("*", (req, res) => {
  res.status(404).render("not-found", { url: req.originalUrl });
});

app.listen(port, () =>
  console.log(
    `Server running on PORT ${port}\nLocal:\thttp://localhost:${port}`
  )
);
