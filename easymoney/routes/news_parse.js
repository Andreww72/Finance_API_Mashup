const express = require('express');
const logger = require('morgan');
const axios = require('axios');
const api = require('../api_config');
const { findWord } = require('most-common-words-by-language');

const router = express.Router();
router.use(logger('tiny'));

// News parsing use case requires:
//   1) News API
//   2) Yahoo Finance API
//   3) Alpha Advantage API

// News parsing use case process:
//   User selects news country and category
//   First API fetches corresponding headlines
//   Titles are parsed for company names
//   Second API converts company name to stock symbol
//   Third API retrieves stock information with symbol 
//   Display table to user with news / related companies (optional link to further stock detail)

// Route for use case parsing trending news, and finding associated company information
router.get('/:country/:category', (req, res) => {
    // Handle parameters and construct url for retrieving recent headines
    const country = req.params.country.toLowerCase();
    const category = req.params.category.toLowerCase();
    const url = `${api.newsApi.hostname}${api.newsApi.path_top}?country=${country}&category=${category}&apiKey=${api.newsApi.key}`;

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

                    // Remove words with punctuation, real words, extra short
                    if (removeWord(word)) continue;

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

                // Only return articles with a match
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

// Check if a word shouldn't be considered as a possible company name
// Excluded if includes unusual punctuation, too short, not alphabetical, a common English word.
function removeWord(word) {
    let firstLetter = word[0];
    
    if (word.length < 2 || !firstLetter.match(/[a-z]/i)) return true;
    if (word.includes("'") || word.includes("$") ||
    word.includes("(") || word.includes(")") ||
    word.includes("?") || word.includes("!") ||
    word.includes(".") || word.includes(",") ||
    word.includes("'") || word.includes('"') ||
    word.includes("/") || word.includes('’') ||
    word.includes(":") || word.includes("%")) return true;
    if (findWord(word).hasOwnProperty('english')) return true;
    return false;
}

// Use Yahoo Finance API to convert a company name to symbol
async function getCompanySymbol(name) {
    const url = `${api.yahooFin.hostname}${api.yahooFin.path}?query=${name}&region=1&lang=en&callback=YAHOO.Finance.SymbolSuggest.ssCallback`
    try {
        const response = await axios.get(url);
        let data = response.data;

        // Data is returned as a string, process into suitable JSON
        data = data.split("YAHOO.Finance.SymbolSuggest.ssCallback(")[1];
        data = data.substring(0, data.length - 2);
        data = JSON.parse(data);

        // Return result if there was one
        if (data.ResultSet.Result.length === 0) return null;
        else return data.ResultSet.Result[0].symbol;

    } catch(error) {
        console.error(error);
    }
}

module.exports = router;
