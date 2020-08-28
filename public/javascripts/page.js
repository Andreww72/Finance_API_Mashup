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

const viewModel = new ExpensesViewModel();
$(function() {
	ko.applyBindings(viewModel);
})