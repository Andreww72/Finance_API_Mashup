const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');
const { findWord } = require('most-common-words-by-language');
const { response } = require('express');

const router = express.Router();
router.use(express.static(path.join(__dirname, 'public')));
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
    path: "/v6"
}

let exRates = {USD: 1};
let currency = "USD";
getExRates();


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
            item.close = data[i].close / exRates[currency];
            item.price = data[i].latestPrice / exRates[currency];
            item.time = data[i].latestTime;
            item.volume = data[i].volume;
            item.change = data[i].change;
            item.changePercent = data[i].changePercent;
            resData.push(item);
        }

        // Return data to client
        res.statusCode = 200; 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resData));

    }).catch(error => {
        console.error(error);
    });
});

router.get('/stock/:symbol', (req, res) => {
    const url = `${aa.hostname}${aa.path}function=OVERVIEW&symbol=${req.params.symbol}&apikey=${aa.key}`;

    axios.get(url).then(response => {
        // Receive data from AA API
        const data = response.data;

        const resData = {
            symbol: data.Symbol,
            name: data.Name,
            description: data.Description,
            industry: data.Industry,
            country: data.Country,
            currency: data.Currency,
            beta: data.Beta,
            bookValue: data.BookValue,
            EBITDA: data.EBITDA / exRates[currency],
            EPS: data.EPS / exRates[currency],
            dividendYield: data.DividendYield
        }

        // Return data to client
        res.statusCode = 200; 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resData));

    }).catch(error => {
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
        res.statusCode = 200; 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(formattedNews));

    }).catch(error => {
        console.error(error);
    });
});

router.get('/parse/:country', (req, res) => {
    const url = `${news.hostname}${news.path_top}?country=${req.params.country}&category=business&apiKey=${news.key}`;
    axios.get(url).then(async response => {

        // Receive data from News API
        const data = response.data;
        let articles = data.articles;
        let resArticles = [];
        if (data.status === 'ok') {

            // Parse news for company names
            for (let i in articles) {
                // Parse article
                articles[i].source = articles[i].source.name;
                const title = articles[i].title;
                const words = title.split(" ");
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
                    if (symbol && !symbol.includes(".")) symbolMatches.push({"symbol": symbol});
                }
                articles[i].symbolMatches = symbolMatches;

                // Only return articles that had a match (with the match + stock info)
                if (symbolMatches.length > 0) {
                    resArticles.push(articles[i]);
                }
            }
        }
        res.statusCode = 200; 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resArticles));
        
    }).catch(error => {
        console.error(error);
    });
});

router.get('/chart/:symbol/:frequency/:dataType', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const frequency = req.params.frequency;
    const dataType = req.params.dataType;
    const mapTypes = {Open: '1. open', High: '2. high', Low: '3. low', Close: '4. close', Volume: '5. volume'}
    const url = `${aa.hostname}${aa.path}function=TIME_SERIES_${frequency.toUpperCase()}&symbol=${symbol}&apikey=${aa.key}`;

    axios.get(url).then(response => {
        // Receive data from AA API
        const data = response.data;

        // Done like this as API returns inconsistent naming of properties with different request parameters
        let metaData = {};
        let timeData = {};
        for (let key in data) {
            if (key.includes("Meta")) metaData = response.data[key];
            else timeData = response.data[key];
        }

        // Construct x and y axes lists
        xlist = [];
        ylist = [];
        for (let key in timeData) {
            xlist.push(key);
            ylist.push(parseFloat(timeData[key][mapTypes[dataType]]).toFixed(2));
        }

        // Limit to time range requested
        

        // Use it in chart API
        const chartUrl = "https://quickchart.io/chart";
        const chartData = {
            type: 'line',
            data: {
                labels: xlist,
                datasets: [{
                    label: symbol,
                    data: ylist
                }]
            },
            options: {
                title: {
                display: true,
                text: `Stock ${symbol} - ${frequency} ${dataType}`,
                fontSize: 22,
                },
                legend: {
                position: 'bottom',
                }
            }
        }

        axios.post(chartUrl, {chart: chartData}, {responseType: "stream"}).then(async response => {
            const writer = fs.createWriteStream("public/img/chart.png")
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve)
                writer.on('error', reject)
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json'); 
            res.end(JSON.stringify({chart: "img/chart.png"}));

        }).catch(error => {
            console.error(error);
        });

    }).catch(error => {
        console.error(error);
    })
});


router.get('/ex/:currency', (req, res) => {
    exRates = req.params.currency;
    res.statusCode = 200; 
    res.end();
});

function getExRates() {
    const url = `${exrate.hostname}${exrate.path}/${exrate.key}/latest/USD`;

    axios.get(url).then(response => {
        // Receive data from ExchangeRate-API
        const data = response.data;
        if (response.data.result === "success") {
            exRates = response.data.conversion_rates;
        }
    }).catch(error => {
        console.error(error);
    });
}

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
