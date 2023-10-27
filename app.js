require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');

const port = process.env.PORT || 8080;

// INITIATE EXPRESS APP
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

app.use(require("./routes/index"));

app.get("*", (req, res) => {
  const url = req.originalUrl;
  res.status(404).render("not-found", { url });
});

app.listen(port, () =>
  console.log(
    `Server running on PORT ${port}\nLocal:\thttp://localhost:${port}`
  )
);
