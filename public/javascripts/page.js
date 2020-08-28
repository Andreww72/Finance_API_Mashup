const Expense = function(data) {
    this.desc = ko.observable(data.desc);
    this.time = ko.observable(data.time);
    
    this.addToDB = async function() {
        const response = await fetch("/api/expenses/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                desc : this.desc(),
                time : this.time()
            })
        });

        let data = await response.json();
        if (response.status === 200) {
            console.log(data);
            viewModel.expenses.push(new Expense({
                desc: data.desc,
                time: data.time
            }));                    
        }
    }
}

const ExpensesViewModel = function() {
    const self = this;
    self.expenses = ko.observableArray();

    self.total = ko.computed(function(){
        let total = 0;
        const hourly_rate = 100;
        for (let p = 0; p < self.expenses().length; p++) {
            total += parseFloat(self.expenses()[p].time());
        }
        return (total*hourly_rate).toFixed(2);
    })

    self.addExpense = function(){
        const expense = new Expense({
            desc: $('#desc').val(),
            time: $('#time').val()
        });

        expense.addToDB();
    }
    
    const refresh = async function() {

        const response = await fetch("/api/expenses/");
        let data = await response.json();

        if (response.status === 200) {
            for (let i = 0; i < data.length; i++) {
                self.expenses.push(new Expense(data[i]));
            }
        } else {
            console.log("Request failed: " + textStatus);
        }
    }
    //refresh immediately to load initial data
    refresh();
};

$(function () {
    'use strict'
  
    feather.replace()
  
    // Graphs
    var ctx = document.getElementById('myChart')
    // eslint-disable-next-line no-unused-vars
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        datasets: [{
          data: [15339, 21345, 18483, 24003, 23489, 24092, 12034],
          lineTension: 0,
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          borderWidth: 4,
          pointBackgroundColor: '#007bff'
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        },
        legend: {
          display: false
        }
      }
    })
  }())

const viewModel = new ExpensesViewModel();
$(function() {
    "use strict";
	ko.applyBindings(viewModel);
})