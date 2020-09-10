// Knockout viewmodel
const ViewModel = function() {
    const self = this;

    // Use case 1 bindings
    self.limitLength = 5;
    self.collections = ['Gains', 'Losses', 'Active', 'Volume', 'Percent'];
    self.limits = [1, 2, 3, 4 ,5];
    self.selectCollection = "";
    self.selectStockLimit = "";
    self.selectArticleLimit = "";
    self.loading = ko.observable(false);
    self.modalLoading = ko.observable(false);
    self.modalContent = ko.observable("");
    self.showStocks = ko.observable(false);
    self.showNews = ko.observable(false);
    self.stocksList = ko.observableArray([]);
    self.newsList = ko.observableArray([]);

    // Use case 2 bindings
    self.showCase2 = ko.observable(false);
    self.case2List = ko.observableArray([
        {title: 'Stock listing A', date: "05/09/2020"},
        {title: 'Stock listing B', date: "06/09/2020"},
        {title: 'Stock listing C', date: "07/09/2020"}
    ]);

    // Clickables
    self.getTopStocks = function() {
        // Ensure correct state
        self.stocksList([]);
        self.newsList([]);
        self.case2List([]);
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showCase2(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/list/${self.selectCollection}/${self.selectStockLimit}`).then(response => {
            if (response.status !== 200) {
                console.log('Issue encountered. Status Code: ' + response.status);
                return;
            }
            response.json().then(data => {
                // Receive server response and place in data bound variable
                self.stocksList(data);

                // Display what server returns
                self.loading(false);
                self.showStocks(true);
                self.showNews(false);
                self.showCase2(false);
            });
        }).catch(error => {
            console.log('Fetch Error :-S', error);
        });
    };

    self.getStockInfo = function(stock) {
        self.modalLoading(true);

        // Call server route
        console.log('called')
        fetch(`/api/stock/${stock.symbol}`).then(response => {
            response.json().then(data => {
                console.log(data);
                self.modalContent(data);
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
                // Receive server response and place in data bound variable
                for (let i in data) {
                    data[i].name = stock.name;
                    self.newsList.push(data[i]);
                }

                // Display what server returns
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
    self.getCase2 = function() {
        self.stocksList([]);
        self.newsList([]);
        self.loading(true);
        self.showStocks(false);
        self.showNews(false);
        self.showCase2(false);
        
        // Get user input

        // Call server route

        // Display what server returns
        self.loading(false);
        self.showCase2(true);
    };
};

// Create view model and bindings
$(function() {
    "use strict";
	ko.applyBindings(new ViewModel());
});
