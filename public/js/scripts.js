// Knockout viewmodel
const ViewModel = function() {
    const self = this;
    self.limitLength = 5;
    self.collections = ['Gains', 'Losses', 'Active', 'Volume', 'Percent'];
    self.limits = [1, 2, 3, 4 ,5];
    self.selectCollection = "";
    self.selectListLimit = "";
    self.selectArticleLimit = "";
    self.loading = ko.observable(false);

    self.showNews = ko.observable(false);
    self.showStocks = ko.observable(false);
    self.newsList = ko.observableArray([]);
    self.stocksList = ko.observableArray([
        {title: 'Stock listing A', date: "05/09/2020"},
        {title: 'Stock listing B', date: "06/09/2020"},
        {title: 'Stock listing C', date: "07/09/2020"}
    ]);

    // Clickables
    self.getNews = function() {
        self.loading(true);
        self.showNews(false);
        self.showStocks(false);

        // User input already passed through bindings
        // Call server route
        fetch(`/api/list/${self.selectCollection}/${self.selectListLimit}/${self.selectArticleLimit}`).then(response => {
            if (response.status !== 200) {
                console.log('Issue encountered. Status Code: ' + response.status);
                return;
            }
            response.json().then(data => {
                // Receive server response and place in data bound variable
                self.newsList(data);

                // Display what server returns
                self.loading(false);
                self.showNews(true);
                self.showStocks(false);
            });
        }).catch(error => {
            console.log('Fetch Error :-S', error);
        });
    };

    self.getStocks = function() {
        self.showNews(false);
        self.showStocks(false);
        
        // Get user input

        // Call server route

        // Display what server returns
        self.showNews(false);
        self.showStocks(true);
    };
};

// Create view model and bindings
$(function() {
    "use strict";
	ko.applyBindings(new ViewModel());
});
