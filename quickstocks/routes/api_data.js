const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const { findWord } = require('most-common-words-by-language');
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

const aa = {
    key: "5Q0WBK9ZWBF6MGKK",
    hostname: "https://www.alphavantage.co",
    path: "/query?"
}

const news = {
    key: "f7bf34ce452b45749f2cb86581c09506",
    hostname: "https://newsapi.org",
    path_top: "/v2/top-headlines",
    path_search: "/v2/everything"
}

const exrate = {
    key: "fc450af0dbc897fc46550f76",
    hostname: "https://v6.exchangerate-api.com",
    path: "/v6?"
}

let useExRate = false;


// Use case 1
router.get('/list/:list/:listLimit', (req, res) => {
    const mapList = {Gains: "gainers", Losses: "losers", Active: "mostactive", Volume: "iexvolume", Percent: "iexpercent"};
    const url = `${iex.hostname_test}${iex.path_list}${mapList[req.params.list]}?token=${iex.key_test}&listLimit=${req.params.listLimit}`;

    axios.get(url).then(response => {
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
        res.end(JSON.stringify(resData));

    }).catch((error) => {
        console.error(error);
    });
});

router.get('/stock/:symbol', (req, res) => {
    const url = `${aa.hostname}${aa.path}function=OVERVIEW&symbol=${req.params.symbol}&apikey=${aa.key}`;

    axios.get(url).then(response => {
        // Receive data from AA API
        const data = response.data;

        // Return data to client
        res.end(JSON.stringify(data));

    }).catch((error) => {
        console.error(error);
    });
});

router.get('/news/:search/:articleLimit', (req, res) => {
    const url = `${news.hostname}${news.path_search}?q=${req.params.search}&apiKey=${news.key}`;

    axios.get(url).then(response => {
        // Receive data from News API
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
router.get('/parse/:country', (req, res) => {
    const url = `${news.hostname}${news.path_top}?country=${req.params.country}&category=business&apiKey=${news.key}`;
    axios.get(url).then(async response => {

        // Receive data from News API
        const data = response.data;
        let articles = data.articles;
        if (data.status === 'ok') {

            // Parse news for company names
            for (let i in articles) {
                // Parse article
                let title = articles[i].title;
                let words = title.split(" ");
                let articleMatches = [];
                
                // Find words that contain a capital letter
                for (let j in words) {
                    let word = words[j];
                    let firstLetter = word[0];
                    
                    // Remove words with punctuation, real words, extra short
                    if (word.length < 2 || !firstLetter.match(/[a-z]/i) ||
                        word.includes("'") || word.includes("$") ||
                        word.includes("(") || word.includes(")") ||
                        word.includes("?") || word.includes("!") ||
                        word.includes(".") || word.includes(",") ||
                        word.includes("'") || word.includes('"') ||
                        word.includes("/") || word.includes('’') ||
                        word.includes(":") || word.includes("%")) {
                        continue;
                    }
                    if (findWord(word).hasOwnProperty('english')) continue;

                    // Find remaining words that contain a capital letter
                    for (let k in word) {
                        const letter = word[0];

                        if (letter == letter.toUpperCase()) {
                            articleMatches.push(word);
                            break;
                        }
                    }
                }
                // Convert company names to symbols
                let symbolMatches = [];
                for (let j in articleMatches) {
                    let symbol = await getCompanySymbol(articleMatches[j]);
                    if (symbol && !symbol.includes(".")) symbolMatches.push(symbol);
                }
                articles.symbolMatches = symbolMatches;

                // Get company data with symbols
                // for (let i in symbolMatches) {
                //     const stockUrl = `${aa.hostname}${aa.path}function=OVERVIEW&symbol=${req.params.symbol}&apikey=${aa.key}`;
                //     axios.get(stockUrl).then(response => {
                //         // Receive data AA API
                //         articles.stockData = response.data;

                //     }).catch((error) => {
                //         console.error(error);
                //     });
                // }
            }
        }
        res.end(JSON.stringify(articles));
        
    }).catch((error) => {
        console.error(error);
    });
});


async function getCompanySymbol(name) {
    const url = `http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=${name}&region=1&lang=en&callback=YAHOO.Finance.SymbolSuggest.ssCallback`
    try {
        const response = await axios.get(url);
        let data = response.data;
        data = data.split("YAHOO.Finance.SymbolSuggest.ssCallback(")[1];
        data = data.substring(0, data.length - 2);
        data = JSON.parse(data);
        if (data.ResultSet.Result.length === 0) return null;
        else return data.ResultSet.Result[0].symbol;

    } catch(error) {
        console.error(error);
    }
}

module.exports = router;
