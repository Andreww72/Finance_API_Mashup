const express = require("express");
const logger = require("morgan");
const axios = require("axios");
const fs = require("fs");
const apis = require("../api_data");

const router = express.Router();
router.use(logger("tiny"));

// Stock charting use case requires:
//   1) Alpha Advantage API
//   2) QuickChartIO API

// Stock charting use case process:
//   User inputs a stock symbol
//   First API fetches stock data
//   Second API charts retrieved data
//   Display chart to user with optional link to further stock detail

// Route for use case showing stock charts
router.get("/:symbol/:frequency/:dataType", (req, res) => {
    // Handle parameters and construct url for desired stock data
    const symbol = req.params.symbol.toUpperCase();
    const frequency = req.params.frequency;
    const dataType = req.params.dataType;
    const url = `${apis.alphaAdv.hostname}${apis.alphaAdv.path}function=TIME_SERIES_${frequency.toUpperCase()}_ADJUSTED&symbol=${symbol}&apikey=${apis.alphaAdv.key}`;

    // Call Alpha Advantage API for stock data
    axios.get(url).then(response => {
        // Receive data, 
        const data = response.data;

        // If no data return to client and inform of no data
        if (data.hasOwnProperty('Error Message')) {
            console.error('No chart data available');
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({error: "No data for request"}));
        }

        // Handle differing property naming which occurs for some reason
        let metaData = {};
        let timeData = {};
        for (let key in data) {
            if (key.includes("Meta")) metaData = response.data[key];
            else timeData = response.data[key];
        }

        // Construct x and y lists for chart
        xlist = [];
        ylist = [];
        const mapTypes = {Open: "1. open", High: "2. high", Low: "3. low", Close: "4. close", Volume: "5. volume"};
        for (let key in timeData) {
            xlist.push(key);
            ylist.push(parseFloat(timeData[key][mapTypes[dataType]]).toFixed(2));
        }
        xlist = xlist.reverse();
        ylist = ylist.reverse();

        // Design chart
        const chartData = {
            type: "line",
            data: {
                labels: xlist,
                datasets: [{
                    label: symbol,
                    data: ylist,
                    fill: false,
                    borderColor: "blue",
                    pointRadius: 0
                }]
            },
            options: {
                title: {
                display: true,
                text: `Stock ${symbol} - ${frequency} ${dataType}`,
                fontSize: 22,
                },
                legend: {
                position: "bottom",
                }
            }
        }

        // Send post request to Quick Chart API with chart data
        const chartUrl = `${apis.quickChart.hostname}${apis.quickChart.path}`;
        axios.post(chartUrl, {chart: chartData}, {responseType: "stream"}).then(async response => {

            // Save response to public/img for client to access
            const writer = fs.createWriteStream("public/img/chart.png")
            response.data.pipe(writer);

            // Ensure all file is received (hence async .then)
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve)
                writer.on("error", reject)
            });
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Return to client and provide chart location
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({chart: "img/chart.png"}));

        }).catch(error => {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
    }).catch(error => {
        console.error(error);
        res.statusCode = 500;
        res.end();
    })
});

module.exports = router;
