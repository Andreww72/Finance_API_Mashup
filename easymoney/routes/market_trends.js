const express = require("express");
const logger = require("morgan");
const axios = require("axios");
const api = require("../api_config");

const router = express.Router();
router.use(logger("tiny"));

// Market trends use case requires:
//   1) IEX Cloud API
//   2) News API
//   3) Alpha Advantage API

// Market trends use case process:
//   User selects a trend type (e.g. top gains, most active ...)
//   First API fetches top 'n' stocks for the trend
//   Display table to user with stocks and some information
//   User can select show news by stock/company
//   Second API searches for news on a stock
//   Display new table to user with news articles

// Route for use case finding trending stocks and associated news, trending stocks component
router.get("/list/:list/:listLimit", (req, res) => {
    // Handle parameters and construct url for desired stock data
    const mapList = {Gains: "gainers", Losses: "losers", Active: "mostactive", Volume: "iexvolume", Percent: "iexpercent"};
    const listLimit = req.params.listLimit;
    const listType = mapList[req.params.list]
    const url = `${api.iexCloud.hostname_prod}${api.iexCloud.path_list}${listType}?token=${api.iexCloud.key_prod}&listLimit=${listLimit}`;

    // Call IEX Cloud API for trending stock list data
    axios.get(url).then(response => {
        // Receive data and take desired properties
        const data = response.data;

        // Check for a result
        if (data === {}) {
            res.statusCode = 200; 
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({error: "Not a symbol"}));

        } else {
            resData = [];
            for (let i in data) {
                item = {};
                item.symbol = data[i].symbol;
                item.name = data[i].companyName;
                item.exchange = data[i].primaryExchange;
                item.close = data[i].close;
                item.price = data[i].latestPrice;
                item.time = data[i].latestTime;
                item.volume = data[i].volume;
                item.change = data[i].change;
                item.changePercent = (data[i].changePercent * 100).toFixed(2);
                resData.push(item);
            }

            // Return data to client
            res.statusCode = 200; 
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(resData));
        }

    }).catch(error => {
        console.error(error);
        res.statusCode = 500;
        res.end();
    });
});

// Route for use case finding trending stocks and associated news, news component
router.get("/news/:search/:articleLimit", (req, res) => {
    // Handle parameters and construct url for desired news search
    const search = req.params.search;
    const url = `${api.newsApi.hostname}${api.newsApi.path_search}?q=${search}&apiKey=${api.newsApi.key}`;

    // Call News API for searched news
    axios.get(url).then(response => {
        // Receive data and take desired properties
        const data = response.data;

        let formattedNews = [];
        if (data.status === "ok") {
            for (let j in data.articles) {
                // Limit to number of articles per stock user selected
                if (j >= req.params.articleLimit) break;
                // Tweak a few things
                data.articles[j].source = data.articles[j].source.name;
                data.articles[j].publishedAt = data.articles[j].publishedAt.split("T")[0];
                formattedNews.push(data.articles[j]);
            }
        } else {
            console.error("News API returned error");
            res.statusCode = 500;
            res.end();
        }

        // Return data to client
        res.statusCode = 200; 
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(formattedNews));

    }).catch(error => {
        console.error(error);
        res.statusCode = 500;
        res.end();
    });
});

// Route for displaying additional company description + stats in client modal
router.get("/symbol/:symbol", (req, res) => {
    // Handle parameters and construct url for desired symbol data
    const symbol = req.params.symbol;
    const url = `${api.alphaAdv.hostname}${api.alphaAdv.path}function=OVERVIEW&symbol=${symbol}&apikey=${api.alphaAdv.key}`;

    // Call Alpha Advantage API for stock data
    axios.get(url).then(response => {
        // Receive data
        const data = response.data;

        // If no data return to client and inform of no data
        if (Object.getOwnPropertyNames(data).length == 0) {
            console.error("No stock data for symbol");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({error: "No data for symbol"}));

        } else {
            // Take desired properties
            const resData = {
                symbol: data.Symbol,
                name: data.Name,
                description: data.Description,
                industry: data.Industry,
                country: data.Country,
                currency: data.Currency,
                beta: data.Beta,
                bookValue: data.BookValue,
                EBITDA: data.EBITDA,
                EPS: data.EPS,
                dividendYield: data.DividendYield
            }

            // Return data to client
            res.statusCode = 200; 
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(resData));
        }
    }).catch(error => {
        console.error(error);
        res.statusCode = 500;
        res.end();
    });
});

module.exports = router;
