const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const { response } = require('express');
const router = express.Router();

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

router.use(logger('tiny'));

router.get("/", function(req, res){
    res.end("${hostname}${path}}${options}?token=${key}");
});

router.get('/list/:list/:limit', (req, res) => {
    const mapList = {Gains: "gainers", Losses: "losers", Active: "mostactive", Volume: "iexvolume", Percent: "iexpercent"};
    const url = `${iex.hostname_test}${iex.path_list}${mapList[req.params.list]}?token=${iex.key_test}&listLimit=${req.params.limit}`;

    axios.get(url).then(async response => {
        // Receive data from first API (IEX Cloud)
        const data = response.data;
        
        // Take desired data
        resData = [];
        for (let i in data) {
            item = {};
            item.symbol = data[i].symbol;
            item.name = data[i].companyName;
            item.exchange = data[i].primaryExchange;
            item.close = data[i].close;
            item.time = data[i].latestTime;
            item.volume = data[i].volume;
            item.change = data[i].change;
            item.changePercent = data[i].changePercent;

            // Use data to call the second API (News API)
            const news = await searchNews(item.name);

            // Format response and send to client
            let formattedNews = [];
            if (news.status === 'ok') {
                for (let j in news.articles) {
                    let article = [];
                    // TODO FORMAT NEWS HERE
                    formattedNews.push(article);
                }
                item.news = news;
            } else {
                console.error("News API returned error");
            }

            resData.push(item);
        }
        console.log(JSON.stringify(resData));
        res.end(JSON.stringify(resData));

    }).catch((error) => {
        console.error(error);
    });
});

router.get('/news_top/:country', (req, res) => {
    const url = `${news.hostname}${news.path_top}?country=${req.params.country}&category=business&apiKey=${news.key}`;
    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
});

async function searchNews(search) {
    const url = `${news.hostname}${news.path_search}?q=${search}&apiKey=${news.key}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch(error) {
        console.error(error);
    }
}

function getStock(stock) {
    const url = `${iex.hostname_test}${iex.path_stock}${stock}/company?token=${iex.key_test}`;
    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
};

module.exports = router;
