/**
 * HTTP Server Component: vehicles 
 * 
 * File Name: index.js
 * 
 * Purpose: Used to register new vehicles and to view their profiles.
 */

"use strict";

/**
 * Import external modules.
 */

var express = require('express');
var engine = require('ejs-locals');

/**
 * Import built-in modules.
 */

var path = require('path');

/**
 * Import libraries.
 */

var map = require('../../library/route-map').map; // Maps URL paths to route functions.

/**
 * Import routes.
 */

var registration = require('./routes/registration');

/**
 * Configure application.
 */

var app = express();

app.configure(function () {
	app.engine('ejs', engine);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use('/static', express.static(path.join(__dirname, 'static')));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});


/**
 * Map urls and HTTP verbs to routes.
 */

app.map = map;

app.map(app, {
	'/vehicle': {
		'/add': {
			get: registration.showRegistrationForm,
			post: registration.addProfile
		},
		'/view': {
			'/:vehicleId': {
				get: registration.showProfile,
				'/image': {
					'/:imageId': {
						get: registration.sendFile
					}
				}
			},
		}
	},
	'/seller': {
		'/vehicles': {
			get: registration.listVehicles
		}
	}
});

module.exports = {
	app: app
};