const path = require("path");
const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");
const Table = require("./models/tableModel");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const port = 3000;
const compression = require("compression");
const tableRouter = require("./routes/tableRoutes.js");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const AppError = require("./utils/appError");
app.enable("trust proxy");

// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));

//1)Global Middlewares
//Implementing CORS
app.use(
  cors({
    origin: "*",
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//Rate limiter ,limits request from same Api
const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP ,please try in an hour !",
});

app.use("/api", limiter);

//Body parser
app.use(express.json());
app.use(cookieParser());
//Data sanitization against No sql query injection
app.use(mongoSanitize());
//XSS prevention'
app.use(xss());
//Helmet , sets Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));

//Parameter prevention
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
//Serving static files
// app.use(express.static(path.join(__dirname, "/starter/public")));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
//Test Middleware
app.use((req, res, next) => {
  next();
});
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 3)ROUTES
app.use("/", tableRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
