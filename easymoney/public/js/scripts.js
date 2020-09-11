// Knockout viewmodel
const ViewModel = function() {
    const self = this;

    // General bindings
    self.loading = ko.observable(false);
    self.error = ko.observable(false);
    self.modalLoading = ko.observable(false);
    self.modalContent = ko.observable("");

    // Chart stock bindings
    self.frequencies = ["Daily", "Weekly", "Monthly"];
    self.dataTypes = ["Close", "Open", "High", "Low", "Volume"];
    self.inputSymbol = "";
    self.selectFrequency = "Monthly";
    self.selectDataType = "Close";
    self.showCharts = ko.observable(false);
    self.chartLink = ko.observable("");

    // Trending stocks bindings
    self.collections = ["Gains", "Losses", "Active", "Volume", "Percent"];
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
    self.categories = ["Business", "Entertainment", "General", "Health", "Science", "Sports", "Technology"];
    self.selectCategory = "Business";
    self.showParsed = ko.observable(false);
    self.parsedList = ko.observableArray([]);


    // Chart stock use case
    self.chartStocks = function() {
        // Ensure correct state
        self.loading(true);
        self.error(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);
        
        // User input already passed through bindings
        // TODO input validation here
        if (self.inputSymbol.match(/^[A-Za-z]+$/)) {

            // Call server route
            fetch(`/api/chart/${self.inputSymbol}/${self.selectFrequency}/${self.selectDataType}`).then(response => {

                // Receive server response
                response.json().then(data => {
                    if (data.hasOwnProperty("error")) {
                        console.log("Input error");
                        self.error(true);
                        self.loading(false);

                    } else {
                        self.chartLink(data.chart);

                        // Allow client to display
                        self.loading(false);
                        self.showCharts(true);
                    }
                });
            }).catch(error => {
                console.log("Fetch Error :-S", error);
                self.error(true);
                self.loading(false);
            });
        } else {
            console.log("Input error");
            self.error(true);
            self.loading(false);
        }
    };


    // Market trends use case
    self.getTopStocks = function() {
        // Ensure correct state
        self.stocksList([]);
        self.newsList([]);
        self.loading(true);
        self.error(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/list/${self.selectCollection}/${self.selectStockLimit}`).then(response => {
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                return;
            }
            response.json().then(data => {
                // Receive server response
                self.stocksList(data);

                // Allow client to display
                self.loading(false);
                self.showStocks(true);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.error(true);
            self.loading(false);
        });
    };

    self.getStockNews = function(stock) {
        self.loading(true);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/news/${stock.name}/${self.selectArticleLimit}`).then(response => {
            if (response.status !== 200) {
                console.log("Issue encountered. Status Code: " + response.status);
                return;
            }
            response.json().then(data => {
                // Receive server response
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
            self.error(true);
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
        self.error(false);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);
        
        // User input already passed through bindings
        // Call server route
        fetch(`/api/parse/${self.selectCountry.toLowerCase()}/${self.selectCategory.toLowerCase()}`).then(response => {
            response.json().then(data => {
                // Receive server response
                self.parsedList(data);

                // Allow client to display
                self.loading(false);
                self.showParsed(true);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.error(true);
            self.loading(false);
        });
    };


    // Multi use case
    self.getStockInfo = function(stock) {
        self.modalLoading(true);
        
        // Handle two possibilities here
        let symbol = "";
        if (stock.hasOwnProperty("symbol")) symbol = stock.symbol;
        else symbol = stock.inputSymbol;

        // Call server route
        fetch(`/api/stock/symbol/${symbol}`).then(response => {
            response.json().then(data => {
                // Receive server response
                self.modalContent(data);

                // Allow client to display
                self.modalLoading(false);
            });
        }).catch(error => {
            console.log("Fetch Error :-S", error);
            self.error(true);
            self.loading(false);
        });
    };
};

// Create view model and bindings
$(function() {
    "use strict";
	ko.applyBindings(new ViewModel());
});
