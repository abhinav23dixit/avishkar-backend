const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routes = require("./routes");
const errorHandler = require("./utils/error-handler");
mongoose.connect(
  "mongodb://localhost:27017/avishkar",
  { useNewUrlParser: true }
);

const app = express();
app.use("/api", cookieParser());
app.use("/api", bodyParser.urlencoded({ extended: false }));
app.use("/api", bodyParser.json());
app.use("/api", routes);
app.use(errorHandler);

app.listen(3001, err => {
  if (err) throw err;
  console.log("> Ready on http://localhost:3001");
});
