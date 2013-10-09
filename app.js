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
var seller = require('./routes/sellers/registration');
var email = require('./routes/sellers/email-address-verification');
var login = require('./routes/sellers/login');
var password = require('./routes/sellers/password-reset');
var vehicle = require('./routes/vehicles/registration');

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
		uploadDir: __dirname.concat('/uploads/img/vehicles')
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

/*
 * Route requests.
 */

app.map = map;

app.map(app, {
    '/': {
		get: main.showHomePage
    },
	'/seller': {
		'/add': {
			get: seller.showRegistrationForm,
			post: seller.validateInputs
		},
		'/view': {
			get: seller.showProfile
		},
		'/edit': {
			get: seller.showRegistrationForm,
			post: seller.validateInputs
		},
		'/remove': {
			get: seller.removeProfile
		},
		'/verify-email-address': {
			get: email.verifyEmailAddress
		},
		'/login': {
			get: login.showLoginForm,
			post: login.authenticateSeller
		},
		'/password': {
			'/forgot': {
				get: password.showPasswordForgottenForm,
				post: password.sendPasswordResetEmail
			},
			'/reset': {
				get: password.showPasswordResetForm,
				post: password.resetPassword
			}
		},
		'/vehicles': {
				get: vehicle.listSellerVehicles
		}
	},
	'/vehicle': {
		'/add': {
			get: vehicle.showRegistrationForm,
			post: vehicle.addProfile
		},
		'/view': {
			'/:vehicleId': {
				get: vehicle.showProfile,
				'/photo': {
					'/:photoId': {
						get: vehicle.sendPhoto
					}
				}
			}
		},
		'/edit': { //TODO Add :vehicleId
			get: vehicle.showRegistrationForm,
			post: vehicle.editProfile
		},
		'/remove': { //TODO Add :vehicleId
			get: vehicle.removeProfile //TODO Change to post
		}
	}
});

/**
 * Start web server and connect to database.
 */

http.createServer(app).listen(app.get('port'), function() {
    console.log("Web server listening on port " + app.get('port') + '.');
	databaseServer.connect();
});