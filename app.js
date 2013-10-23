/*jslint node: true*/

'use strict';

/*
 * Component: main 
 *
 * Filename: app.js
 *
 * Purpose: Starts the web server, then connects to the database server. 
 */

/* Import external modules. */
var engine = require('ejs-locals');
var express = require('express');

/* Import built-in modules. */
var http = require('http');
var path = require('path');

/* Import libraries. */
var map = require('./library/route-map').map;

/* Import configurations. */
var databaseServer = require('./configuration/database').mongodb;

/* Import routes. */
var main = require('./routes/main');
var seller = require('./routes/sellers/registration');
var email = require('./routes/sellers/email-address-verification');
var login = require('./routes/sellers/login');
var password = require('./routes/sellers/password-reset');
var vehicle = require('./routes/vehicles/registration');
var order = require('./routes/orders/registration');

/* Configure application. */
var app = express();

app.configure(function () {
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

/* Route requests. */
app.map = map;

app.map(app, {
    '/': {
		get: main.showHomePage
    },
	'/sellers': {
		'/add': {
			get: seller.showRegistrationForm,
			post: seller.validateInputs
		},
		'/list': { // Only dealerships should be visible to the public.
		}
	},
	'/seller': {
		'/:sellerId': {
			get: seller.checkSession,
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
			'/vehicle': {
				'/add': {
					get: vehicle.showRegistrationForm,
					post: vehicle.addProfile
				},
				'/list': {
						get: vehicle.listSellerVehicles
				},
				'/:vehicleId': {
					'/view': {
						get: vehicle.showProfile
					},
					'/photo': {
						'/:photoId': {
							get: vehicle.sendPhoto
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
			},
			'/order': {
				'/add': {
					get: order.showCart,
					post: order.checkout
				},
				'/list': {
					get: order.list
				},
				'/:orderid': {
					'/view': {
						get: order.show
					},
					'/edit': {
						get: order.showCart,
						post: order.edit
					},
					'/remove': {
						get: order.remove
					}
				}
			}
		}
	},
	'/login': {
		get: login.form,
		post: login.authenticate
	},
	'/password': {
		'/forgot': {
			get: password.forgottenForm,
			post: password.email
		},
		'/reset': {
			get: password.resetForm,
			post: password.reset
		}
	}
});

/* Start web server, then connect to database server. */
http.createServer(app).listen(app.get('port'), function() {
    console.log("Web server listening on port ".concat(app.get('port')).concat('.'));
	databaseServer.connect();
});
