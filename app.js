const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const redis = require('redis');

const indexRouter = require('./routes/index');
const apiData = require('./routes/api_data');

const app = express();

// Remember to install redis on container and systemctl enable + start it
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
	console.log("Error " + err);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiData);

module.exports = app;
