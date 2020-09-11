const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');

const router = express.Router();
router.use(logger('tiny'));

const alphaAdv = {
    key: "5Q0WBK9ZWBF6MGKK",
    hostname: "https://www.alphavantage.co",
    path: "/query?"
}

const chartIo = "https://quickchart.io/chart";

router.get('/:symbol/:frequency/:timeRange/:dataType', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const frequency = req.params.frequency;
    const timeRange = req.params.timeRange;
    const dataType = req.params.dataType;
    const mapTypes = {Open: '1. open', High: '2. high', Low: '3. low', Close: '4. close', Volume: '5. volume'}
    const url = `${alphaAdv.hostname}${alphaAdv.path}function=TIME_SERIES_${frequency.toUpperCase()}&symbol=${symbol}&apikey=${alphaAdv.key}`;

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

        // TODO Limit to time range requested

        // Use it in chart API
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

        axios.post(chartIo, {chart: chartData}, {responseType: "stream"}).then(async response => {
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

module.exports = router;
