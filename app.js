const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const stockNews = require('./routes/stock_news');
const parseNews = require('./routes/parse_news');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/stocks', stockNews);
app.use('/news', parseNews); 


var db = [];
var Expense = function(name, time){
  this.desc = name;
  this.time = time;
}
db.push(new Expense('phone call', 0.2));
db.push(new Expense('writing', 0.6));
db.push(new Expense('reading', 0.9));

app.get("/api/expenses/", function(req, res){
    res.json(200, db);
});

app.post("/api/expenses/", function(req, res){
    console.log('req', req.body);
    db.push(new Expense(req.body.desc, req.body.time));
    res.json(200, db[db.length-1]);
    res.end();
});

module.exports = app;
