const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");

const indexRouter = require("./routes/index");
const apiStockNews = require("./routes/stock_news");
const apiStockChart = require("./routes/stock_chart");
const apiNewsParse = require("./routes/news_parse");

// Setup application
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Setup application routes
app.use("/", indexRouter);
app.use("/api/stock", apiStockNews);
app.use("/api/parse", apiNewsParse);
app.use("/api/chart", apiStockChart);

module.exports = app;
