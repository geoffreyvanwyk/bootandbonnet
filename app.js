/*jshint node: true*/

'use strict';

/**
 * @file app.js
 * Component: main
 * Purpose: Configures and starts the web server, then connects to the database server.
 */

/* Import external modules. */
var engine = require('ejs-locals');
var express = require('express');

/* Import built-in modules. */
var http = require('http');
var path = require('path');

/* Import libraries. */
var map = require('./library/route-map').map;

/* Import routes. */
var email = require('./routes/email-address-verification');
var login = require('./routes/login');
var main = require('./routes/main');
var orders = require('./routes/order-placement');
var password = require('./routes/password-reset');
var search = require('./routes/search');
var sellers = require('./routes/seller-registration');
var vehicles = require('./routes/vehicle-registration');

/* Import configurations. */
var databaseServer = require('./configuration/database').mongodb;

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
	'/error': {
		get: main.showErrorPage
	},
	'/users': {
		'/:userId': {
			'/verify-email-address': {
				get: email.verifyEmailAddress
			}
		},
		'/login': {
			get: login.showForm,
			post: login.authenticate
		},
		'/password': {
			'/forgot': {
				get: password.showForgotForm,
				post: password.sendLink
			},
			'/reset': {
				get: password.showResetForm,
				post: password.reset,
				'/email-sent': {
					get: password.showEmailSentPage
				}
			}
		}
	},
	'/sellers': {
		'/add': {
			get: sellers.showRegistrationForm,
			post: sellers.add
		},
		'/:sellerId': {
			'/view': {
				get: sellers.show
			},
			'/edit': {
				get: sellers.showEditForm,
				post: sellers.edit
			},
			'/remove': {
				get: sellers.remove
			},
			'/vehicles': {
				get: vehicles.listSellerVehicles
			},
			'/orders': {
				get: orders.list
			}
		}
	},
	'/vehicles': {
		'/add': {
			get: vehicles.showRegistrationForm,
			post: vehicles.add
		},
		'/:vehicleId': {
			'/view': {
				get: vehicles.show
			},
			'/photos': {
				'/:photoId': {
					get: vehicles.sendPhoto
				}
			},
			'/edit': {
				get: vehicles.showEditForm,
				post: vehicles.edit
			},
			'/remove': {
				get: vehicles.remove
			},
			'/email-seller': {
				post: search.emailSeller
			}
		}
	},
	'/orders': {
		'/place': {
			get: orders.showCart,
			post: orders.place
		},
		'/:orderId': {
			'/view': {
				get: orders.showCart
			},
			'/edit': {
				get: orders.showCart,
				post: orders.edit
			},
			'/pay': {
				post: orders.pay
			},
			'/remove': {
				get: orders.remove
			}
		},
		'/banking-details': {
			get: orders.showBankDetails
		}
	}
});

/* Start web server, then connect to database server. */
http.createServer(app).listen(app.get('port'), function() {
    console.log("Web server listening on port ".concat(app.get('port')).concat('.'));
	databaseServer.connect();
});
