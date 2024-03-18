var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var helmet = require("helmet");
var expressStaticGzip = require("express-static-gzip");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var foundersRouter = require("./routes/api/founder");

var app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow loading resources from the same origin
      scriptSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://accounts.google.com/gsi/client",
        "https://accounts.google.com https://apis.google.com/js/api.js",
        "https://apis.google.com/",
      ], // Allow scripts from 'self' and Google Sign-In,
      frameSrc: ["'self'", "https://accounts.google.com/"],
    },
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

app.set("trust proxy", true);

app.use(logger("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/dist/bundle",
  expressStaticGzip(path.join(__dirname, "dist/bundle"), {
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    setHeaders: function (res, path) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);

// connect to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => {
    console.log("mongodb connected true");
  })
  .catch((err) => console.log(err, "mongoerr"));

// webpack
if (process.env.NODE_ENV === "development") {
  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config");
  var compiler = webpack(webpackConfig);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      // noInfo: true,
      publicPath: webpackConfig.output.publicPath,
    })
  );

  app.use(require("webpack-hot-middleware")(compiler));
}

// Route handler
app.use("/api/v1", apiRouter); // api route handler
app.use("/api/v1/founders", foundersRouter);
app.use("/", indexRouter); // react handler

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
