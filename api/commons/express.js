'use strict';

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

module.exports = function(app){
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(cors());
}