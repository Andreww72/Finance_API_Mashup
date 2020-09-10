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

    // Use case 2 bindings
    self.countries = ['US', 'AU', 'CA', 'CH', 'DE', 'FR', 'GB', 'HK', 'JP', 'NZ'];
    self.currencies = ['USD', 'AUD', 'CAD', 'EUR', 'GBP', 'HKD', 'JPY', 'NZD'];
    self.selectCountry = "";
    self.selectCurrency = "";

    self.showParsed = ko.observable(false);
    self.parsedList = ko.observableArray([
        {title: 'Stock listing A', date: "05/09/2020"},
        {title: 'Stock listing B', date: "06/09/2020"},
        {title: 'Stock listing C', date: "07/09/2020"}
    ]);

    // Clickables
    self.getTopStocks = function() {
        // Ensure correct state
        self.stocksList([]);
        self.newsList([]);
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/list/${self.selectCollection}/${self.selectStockLimit}`).then(response => {
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
        fetch(`/api/stock/${stock.symbol}`).then(response => {
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
        fetch(`/api/news/${stock.name}/${self.selectArticleLimit}`).then(response => {
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
    }


    // Use case 2
    self.parseNews = function() {
        // Ensure correct state
        self.parsedList([]);
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showParsed(false);
        
        // User input already passed through bindings
        // Call server route
        fetch(`/api/parse/${self.selectCountry.toLowerCase()}`).then(response => {
            response.json().then(data => {
                // Receive server response
                console.log(data);
                self.parsedList(data);

                // Allow client to display
                self.loading(false);
                self.showParsed(true);
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
