const express = require('express');
const axios = require('axios');
const logger = require('morgan');
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
    const url = `${iex.hostname_test}${iex.path_list}${req.params.list}?token=${iex.key_test}?listLimit=${req.params.limit}`;

    axios.get(url).then((response) => {

        // Receive data from first API (IEX Cloud)
        const data = response.data;

        // Use data to call the second API (News API)
        searchNews = data.stocksArray;
        resData = [];
        for (let i in stocksArray) {
            resData.push(searchNews(stocksArray[i]));
        }

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


function getStock(stock) {
    const url = `${iex.hostname_test}${iex.path_stock}${stock}/company?token=${iex.key_test}`;

    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
};

function searchNews(search) {
    const url = `{news.hostname}${news.path_top}?q=${search}&apiKey=${news.key}`

    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
}

module.exports = router;
