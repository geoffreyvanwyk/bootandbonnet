/**
 * Import dependencies.
 */

var engine = require('ejs-locals');
var express = require('express');
var http = require('http');
var path = require('path');
var map = require('./route-map');

/**
 * Configure application.
 */

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.engine('ejs', engine);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('xvrT4521ghqw0'));
	app.use(express.cookieSession());
	app.use(app.router);
	app.use('/assets', express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

/**
 * Route requests.
 */

var home = require('./routes/home').index;
var sellers = require('./components/sellers');
var login = require('./components/sellers/routes/login').login;

app.use(sellers);

app.map = map;

app.map(app, {
	'/': {
		get: home
	}
});

/**
 * Start web server.
 */

http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});