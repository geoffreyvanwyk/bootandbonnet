/**
 * Import dependencies.
 */

var engine = require('ejs-locals');
var express = require('express');
var http = require('http');
var path = require('path');

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

var map = exports.map = function(app, a, route) {
	route = route || '';
	for (var key in a) {
		switch (typeof a[key]) {
			case 'object': // { '/path': { ... }}
				app.map(app, a[key], route + key);
				break;
			case 'function': // get: function(){ ... }
				app[key](route, a[key]);
				break;
		}
	}
};

app.map = map;

var home = require('./routes/home').index;
var sellers = require('./components/sellers');

app.use(sellers);

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