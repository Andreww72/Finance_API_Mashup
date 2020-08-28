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
    hostname: "newsapi.org/api/"
}

let db = [];
const Expense = function(name, time){
  this.desc = name;
  this.time = time;
}
db.push(new Expense('phone call', 0.2));
db.push(new Expense('writing', 0.6));
db.push(new Expense('reading', 0.9));


router.use(logger('tiny'));

router.get("/", function(req, res){
    res.end("${hostname}${path}}${options}?token=${key}");
});

router.get('/list/:list', (req, res) => {
    const url = `${iex.hostname_test}${iex.path_list}${req.params.list}?token=${iex.key_test}`

    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
});

router.get('/stock/:stock', (req, res) => {
    const url = `${iex.hostname_test}${iex.path_stock}${req.params.stock}/company?token=${iex.key_test}`

    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
});

router.get("/expenses", function(req, res){
    res.json(200, db);
});

router.post("/expenses", function(req, res){
    console.log('req', req.body);
    db.push(new Expense(req.body.desc, req.body.time));
    res.json(200, db[db.length-1]);
    res.end();
});

module.exports = router;
