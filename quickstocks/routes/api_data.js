const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const { response } = require('express');
const router = express.Router();
router.use(logger('tiny'));

const iex = {
    key_prod: "pk_01dff3cecba84f319d83cd2f8176b098",
    key_test: "Tpk_94a72a7825f5411784cc74f20d9dab38",
    hostname_prod: "https://cloud.iexapis.com",
    hostname_test: "https://sandbox.iexapis.com",
    path_list: "/stable/stock/market/list/",
    path_stock: "/stable/stock/"
}

const news = {
    key: "f7bf34ce452b45749f2cb86581c09506",
    hostname: "https://newsapi.org",
    path_top: "/v2/top-headlines",
    path_search: "/v2/everything"
}


// Use case 1
router.get('/list/:list/:listLimit', (req, res) => {
    const mapList = {Gains: "gainers", Losses: "losers", Active: "mostactive", Volume: "iexvolume", Percent: "iexpercent"};
    const url = `${iex.hostname_test}${iex.path_list}${mapList[req.params.list]}?token=${iex.key_test}&listLimit=${req.params.listLimit}`;

    axios.get(url).then(async response => {
        // Receive data from first API (IEX Cloud)
        const data = response.data;

        // Add stock data to return client
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
            item.changePercent = data[i].changePercent;
            resData.push(item);
        }

        // Return data to client
        console.log(resData);
        res.end(JSON.stringify(resData));

    }).catch((error) => {
        console.error(error);
    });
});

router.get('/news/:search/:articleLimit', (req, res) => {
    const url = `${news.hostname}${news.path_search}?q=${req.params.search}&apiKey=${news.key}`;

    axios.get(url).then(response => {
        // Receive data from second API (News API)
        const data = response.data;

        // Limit the number of articles per stock
        let formattedNews = [];
        if (data.status === 'ok') {
            for (let j in data.articles) {
                if (j >= req.params.articleLimit) break;
                // Tweak a few things
                data.articles[j].source = data.articles[j].source.name;
                data.articles[j].publishedAt = data.articles[j].publishedAt.split("T")[0];
                formattedNews.push(data.articles[j]);
            }

        } else {
            console.error("News API returned error");
            console.error(data);
        }

        // Return data to client
        res.end(JSON.stringify(formattedNews));

    }).catch((error) => {
        console.error(error);
    });
});


// Use case 2
router.get('/news_top/:country', (req, res) => {
    const url = `${news.hostname}${news.path_top}?country=${req.params.country}&category=business&apiKey=${news.key}`;
    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
});

function getStock(stock) {
    const url = `${iex.hostname_test}${iex.path_stock}${stock}/company?token=${iex.key_test}`;
    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
};

module.exports = router;
