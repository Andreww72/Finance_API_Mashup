// Knockout viewmodel
const ViewModel = function() {
    const self = this;
    self.limitLength = 5;
    self.collections = ['Gains', 'Losses', 'Active', 'Volume', 'Percent'];
    self.selectCollection = "";
    self.limits = [1, 2, 3, 4 ,5];
    self.selectLimit = "";
    self.showNews = ko.observable(false);
    self.showStocks = ko.observable(false);

    // Mock data
    self.newsList = ko.observableArray([
        {
            symbol: "AAPL",
            amount: "$100.01",
            image: "https://s.marketwatch.com/public/resources/images/MW-IN950_shangh_ZG_20200906232354.jpg",
            title: "SMIC slumps, SoftBank drops in mixed Asia markets",
            source: "MarketWatch",
            date: "2020-09-07",
            link: "https://www.marketwatch.com/story/asian-markets-mixed-as-china-export-data-offsets-impact-of-wall-streets-retreat-2020-09-06"},
        {
            symbol: "GOOG",
            amount: "$85.32",
            image: "https://image.cnbcfm.com/api/v1/image/106297479-1576462131957gettyimages-943704498.jpeg?v=1599438225",
            title: "China says August exports beat expectations, jumping 9.5% from a year ago",
            source: "CNBC News",
            date: "2020-09-07",
            link: "https://www.cnbc.com/2020/09/07/china-trade-exports-imports-in-august-2020.html"
        },
        {
            symbol: "TLSA",
            amount: "$77.77",
            image: "https://static.foxnews.com/foxnews.com/content/uploads/2018/09/USSNimitzFeatured.jpg",
            title: "Search underway in Arabian Sea for missing US Navy sailor: report",
            source: "Fox News",
            date: "2020-09-07",
            link: "https://www.foxnews.com/world/search-underway-in-northern-arabian-sea-for-missing-us-navy-sailor"
        }
    ]);

    self.stocksList = ko.observableArray([
        {title: 'Stock listing A', date: "05/09/2020"},
        {title: 'Stock listing B', date: "06/09/2020"},
        {title: 'Stock listing C', date: "07/09/2020"}
    ]);

    // Clickables
    self.getNews = function() {
        self.showNews(false);
        self.showStocks(false);

        // User input already passed through bindings
        const collection = self.selectCollection;
        const limit = self.selectLimit;
        
        // Call server route
        fetch(`/api/list/${collection}/${limit}`).then(response => {
            if (response.status !== 200) {
                console.log('Issue encountered. Status Code: ' + response.status);
                return;
            }
            response.json().then(data => {
                // Receive server response and place in appropriate data variables
                self.newssList(data);
            });
        }).catch(error => {
            console.log('Fetch Error :-S', error);
        });

        // Display what server returns
        self.showNews(true);
        self.showStocks(false);
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
