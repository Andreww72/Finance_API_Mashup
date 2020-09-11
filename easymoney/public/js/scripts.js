// Knockout viewmodel
const ViewModel = function() {
    const self = this;

    // General bindings
    self.loading = ko.observable(false);
    self.modalLoading = ko.observable(false);
    self.modalContent = ko.observable("");

    // Use case 1 bindings
    self.collections = ['Gains', 'Losses', 'Active', 'Volume', 'Percent'];
    self.limits = [1, 2, 3, 4 ,5];
    self.selectCollection = "";
    self.selectStockLimit = "";
    self.selectArticleLimit = "";
    self.showStocks = ko.observable(false);
    self.showNews = ko.observable(false);
    self.stocksList = ko.observableArray([]);
    self.newsList = ko.observableArray([]);

    // Use case 3 bindings
    self.frequencies = ['Daily', 'Weekly', 'Monthly'];
    self.dataTypes = ['Close', 'Open', 'High', 'Low', 'Volume'];
    self.timeRange = ['Past Month', 'Past Year', 'Past 2 Years', 'Past 5 Years', 'Past 10 Years', 'Maximum'];
    self.inputSymbol = "";
    self.selectFrequency = "Daily";
    self.selectDataType = "Close";
    self.selectTimeRange = "Past Year";
    self.showCharts = ko.observable(false);
    self.chartLink = ko.observable("");

    // Parse News bindings
    self.countries = ['US', 'AU', 'CA', 'CH', 'FR', 'GB', 'HK', 'JP', 'NZ'];
    self.selectCountry = "";
    self.categories = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology'];
    self.selectCategory = "Business";
    self.showParsed = ko.observable(false);
    self.parsedList = ko.observableArray([]);


    // Clickables
    self.getTopStocks = function() {
        // Ensure correct state
        self.stocksList([]);
        self.newsList([]);
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/list/${self.selectCollection}/${self.selectStockLimit}`).then(response => {
            if (response.status !== 200) {
                console.log('Issue encountered. Status Code: ' + response.status);
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
            console.log('Fetch Error :-S', error);
        });
    };

    self.getStockInfo = function(stock) {
        self.modalLoading(true);

        // Call server route
        fetch(`/api/stock/symbol/${stock.symbol}`).then(response => {
            response.json().then(data => {
                // Receive server response
                self.modalContent(data);

                // Allow client to display
                self.modalLoading(false);
            });
        }).catch(error => {
            console.log('Fetch Error :-S', error);
        });
    };

    self.getStockNews = function(stock) {
        self.loading(true);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/stock/news/${stock.name}/${self.selectArticleLimit}`).then(response => {
            if (response.status !== 200) {
                console.log('Issue encountered. Status Code: ' + response.status);
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
            console.log('Fetch Error :-S', error);
        });
    };

    self.clearNews = function() {
        self.newsList([]);
        self.showNews(false);
    }


    // Use case 2
    self.parseNews = function() {
        // Ensure correct state
        self.parsedList([]);
        self.loading(true);
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
            console.log('Fetch Error :-S', error);
        });
    };


    // Use case 3
    self.chartStocks = function() {
        // Ensure correct state
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        self.showCharts(false);
        
        // User input already passed through bindings
        // TODO input validation here

        // Call server route
        fetch(`/api/chart/${self.inputSymbol}/${self.selectFrequency}/${self.selectTimeRange}/${self.selectDataType}`).then(response => {
            // Receive server response
            response.json().then(data => {
                self.chartLink(data.chart);
                console.log(data.chart);

                // Allow client to display
                self.loading(false);
                self.showCharts(true);
            });
        }).catch(error => {
            console.log('Fetch Error :-S', error);
        });
    };
};

// Create view model and bindings
$(function() {
    "use strict";
	ko.applyBindings(new ViewModel());
});
