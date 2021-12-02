var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

const troveRouter = require("./routes/troveRouter");
const depositRouter = require("./routes/depositRouter");
const infoRouter = require("./routes/infoRouter");
const notificationRouter = require("./routes/notificationRouter");

const cors = require("cors");
var app = express();
app.set("port", process.env.PORT || 3000);
console.log("the app is ", app);
console.log("Express server listening on port " + app.get("port"));
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.use(cookieParser());

app.use("/trove", troveRouter);
app.use("/deposit", depositRouter);
app.use("/info", infoRouter);
//app.use("/notification", notificationRouter);
app.get("/", (req, res) => {
  res.send({});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.json({ err });
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
