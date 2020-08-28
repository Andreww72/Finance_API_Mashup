const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();

const iex = {
    key_prod: "pk_01dff3cecba84f319d83cd2f8176b098",
    key_test: "Tpk_94a72a7825f5411784cc74f20d9dab38",
    hostname_prod: "https://cloud.iexapis.com",
    hostname_test: "https://sandbox.iexapis.com"
}

router.use(logger('tiny'));

router.get("/", function(req, res){
    res.end("${sandIexUrl}/stable/stock/market/list/${options[0]}?token=${sandIexUrl}");
});

router.get('/:list/', (req, res) => {
    const url = `${iex.hostname_test}/stable/stock/market/list/${req.params.list}?token=${iex.key_test}`

    axios.get(url).then((response) => {
        res.end(JSON.stringify(response.data));
    }).catch((error) => {
        console.error(error);
    });
});

module.exports = router;
