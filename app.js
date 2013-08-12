"use strict";

/**
 * HTTP Server.
 *
 * Filename: app.js
 */

/**
 * Import external modules.
 */

var engine = require('ejs-locals');
var express = require('express');

/**
 * Import built-in modules.
 */

var http = require('http');
var path = require('path');

/**
 * Import components.
 */

var sellers = require('./components/sellers').app;
var vehicles = require('./components/vehicles').app;

/**
 * Import libraries.
 */

var map = require('./library/route-map').map;

/**
 * Import configurations.
 */

var databaseServer = require('./configuration/database').mongodb;

/**
 * Import routes.
 */

var main = require('./routes/main');

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
    app.use(express.bodyParser({
		uploadDir: __dirname.concat('/static/img/vehicles')
	}));
    app.use(express.methodOverride());
    app.use(express.cookieParser('xvrT4521ghqw0'));
    app.use(express.cookieSession());
    app.use(app.router);
    app.use('/static', express.static(path.join(__dirname, 'static')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

/**
 * Route requests.
 */

app.use(sellers);
app.use(vehicles);

app.map = map;

app.map(app, {
    '/': {
		get: main.showHomePage
    }
});

/**
 * Start web server and connect to database.
 */

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
	databaseServer.connect();
});