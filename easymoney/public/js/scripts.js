// Knockout viewmodel
const ViewModel = function() {
    const self = this;

    // General bindings
    self.loading = ko.observable(false);
    self.dataError = ko.observable(false);
    self.connError = ko.observable(false);
    self.modalLoading = ko.observable(false);
    self.modalContent = ko.observable("");
    self.modalError = ko.observable(false);

    // Trending stocks bindings
    self.collections = ["Gains", "Losses", "Active", "Volume"];
    self.limits = [1, 2, 3, 4 ,5];
    self.selectCollection = "";
    self.selectStockLimit = "";
    self.selectArticleLimit = "";
    self.showStocks = ko.observable(false);
    self.showNews = ko.observable(false);
    self.stocksList = ko.observableArray([]);
    self.newsList = ko.observableArray([]);

    // Parse news bindings
    self.countries = ["US", "AU", "CA", "CH", "FR", "GB", "HK", "JP", "NZ"];
    self.selectCountry = "";
    self.categories = ["Business", "Entertainment", "General", "Health", "Science", "Technology"];
    self.selectCategory = "Business";
    self.showParsed = ko.observable(false);
    self.parsedList = ko.observableArray([]);

    // Chart stock bindings
    self.frequencies = ["Daily", "Weekly", "Monthly"];
    self.dataTypes = ["Close", "Open", "High", "Low", "Volume"];
    self.inputSymbol = "";
    self.selectFrequency = "Monthly";
    self.selectDataType = "Close";
    self.showCharts = ko.observable(false);
    self.chartLink = ko.observable("");


    // Market trends use case
    self.getTopStocks = function() {
        // Ensure correct state
        self.stocksList([]);
        self.newsList([]);
        self.loading(true);
        self.dataError(false);
        self.connError(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/list/${self.selectCollection}/${self.selectStockLimit}`).then(response => {
            // Check status code
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                self.connError(true);
                self.loading(false);
                return;
            }

            // Receive server response/data
            response.json().then(data => {
                self.stocksList(data);

                // Allow client to display
                self.loading(false);
                self.showStocks(true);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.dataError(true);
            self.loading(false);
        });
    };

    self.getStockNews = function(stock) {
        self.loading(true);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/news/${stock.name}/${self.selectArticleLimit}`).then(response => {
            // Check status code
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                self.connError(true);
                self.loading(false);
                return;
            }

            // Receive server response/data
            response.json().then(data => {
                for (let i in data) {
                    data[i].name = stock.name;
                    self.newsList.push(data[i]);
                }

                // Allow client to display
                self.loading(false);
                self.showNews(true);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.dataError(true);
            self.loading(false);
        });
    };

    self.clearNews = function() {
        self.newsList([]);
        self.showNews(false);
    }


    // Parse news use case
    self.parseNews = function() {
        // Ensure correct state
        self.parsedList([]);
        self.loading(true);
        self.dataError(false);
        self.connError(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);
        
        // User input already passed through bindings
        // Call server route
        fetch(`/api/parse/${self.selectCountry.toLowerCase()}/${self.selectCategory.toLowerCase()}`).then(response => {
            // Check status code
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                self.connError(true);
                self.loading(false);
                return;
            }

            // Receive server response/data
            response.json().then(data => {
                self.parsedList(data);

                // Allow client to display
                self.loading(false);
                self.showParsed(true);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.dataError(true);
            self.loading(false);
        });
    };

    // Chart stock use case
    self.chartStocks = function() {
        // Ensure correct state
        self.loading(true);
        self.dataError(false);
        self.connError(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);
        
        // User input already passed through bindings
        // TODO input validation here
        if (self.inputSymbol.match(/^[A-Za-z]+$/)) {

            // Call server route
            fetch(`/api/chart/${self.inputSymbol}/${self.selectFrequency}/${self.selectDataType}`).then(response => {
                // Check status code
                if (response.status !== 200) {
                    console.log("Issue encountered. Status Code: " + response.status);
                    self.connError(true);
                    self.loading(false);
                    return;
                }
                // Receive server response/data
                response.json().then(data => {
                    if (data.hasOwnProperty("error")) {
                        console.log("Input error");
                        self.dataError(true);
                        self.loading(false);

                    } else {
                        // Include cache breaker on new image link to force image refresh on subsequent calls
                        self.chartLink(data.chart + "?" + new Date().getTime());

                        // Allow client to display
                        self.loading(false);
                        self.showCharts(true);
                    }
                });
            }).catch(error => {
                console.log("Fetch Error :-S", error);
                self.dataError(true);
                self.loading(false);
            });
        } else {
            console.log("Input error");
            self.dataError(true);
            self.loading(false);
        }
    };

    // Multi use case
    self.getStockInfo = function(stock) {
        // Ensure correct state
        self.modalLoading(true);
        self.modalError(false);

        // Handle two possibilities here
        let symbol = "";
        if (stock.hasOwnProperty("symbol")) symbol = stock.symbol;
        else symbol = stock.inputSymbol;

        // Call server route
        fetch(`/api/stock/symbol/${symbol}`).then(response => {
            // Check status code
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                self.dataError(true);
                self.loading(false);
                return;
            }

            // Receive server response/data
            response.json().then(data => {
                if (data.hasOwnProperty('error')) {
                    self.modalError(true);
                    self.modalContent({error: data.error});
                } else {
                    self.modalContent(data);
                }

                // Allow client to display
                self.modalLoading(false);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.dataError(true);
            self.loading(false);
        });
    };
};

// Create view model and apply bindings
$(function() {
    "use strict";
	ko.applyBindings(new ViewModel());
});
