// Alpha Advantage API (stock data)
const alphaAdv = {
    key: "5Q0WBK9ZWBF6MGKK",
    hostname: "https://www.alphavantage.co",
    path: "/query?"
}

// IEX Cloud API (market data)
const iexCloud = {
    key_prod: "pk_01dff3cecba84f319d83cd2f8176b098",
    key_test: "Tpk_94a72a7825f5411784cc74f20d9dab38",
    hostname_prod: "https://cloud.iexapis.com",
    hostname_test: "https://sandbox.iexapis.com",
    path_list: "/stable/stock/market/list/",
}

// News API (news data)
const newsApi = {
    key: "f7bf34ce452b45749f2cb86581c09506",
    hostname: "https://newsapi.org",
    path_top: "/v2/top-headlines",
    path_search: "/v2/everything"
}

// Quick Chart IO API (produce charts)
const quickChart = {
    hostname: "https://quickchart.io",
    path: "/chart"
}

// Yahoo Finance API (stock name to symbol)
const yahooFin = {
    hostname: "http://d.yimg.com/autoc.finance.yahoo.com",
    path: "/autoc"
}

// Export for use in routers
module.exports = {
    "alphaAdv": alphaAdv,
    "iexCloud": iexCloud,
    "newsApi": newsApi,
    "quickChart": quickChart,
    "yahooFin": yahooFin
};