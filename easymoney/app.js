const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");

const apiMarketTrends = require("./routes/market_trends");
const apiNewsParse = require("./routes/news_parse");
const apiStockChart = require("./routes/stock_chart");

// Setup application
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Setup application routes
app.use("/api/stock", apiMarketTrends);
app.use("/api/parse", apiNewsParse);
app.use("/api/chart", apiStockChart);

// Home page doesn't need a separate router
app.get("/", function(req, res, next) {
    res.render("index", { title: "Express" });
});

module.exports = app;
