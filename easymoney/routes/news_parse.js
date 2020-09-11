const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');
const { findWord } = require('most-common-words-by-language');
//const { response } = require('express');

const router = express.Router();
router.use(logger('tiny'));

const alphaAdv = {
    key: "5Q0WBK9ZWBF6MGKK",
    hostname: "https://www.alphavantage.co",
    path: "/query?"
}

const newsApi = {
    key: "f7bf34ce452b45749f2cb86581c09506",
    hostname: "https://newsapi.org",
    path_top: "/v2/top-headlines",
    path_search: "/v2/everything"
}


router.get('/:country/:category', (req, res) => {
    const country = req.params.country.toLowerCase();
    const category = req.params.category.toLowerCase();
    const url = `${newsApi.hostname}${newsApi.path_top}?country=${country}&category=${category}&apiKey=${newsApi.key}`;

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
                    if (symbol && !symbol.includes(".") && symbol.length > 2) symbolMatches.push({"symbol": symbol});
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
