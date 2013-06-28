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
 * Configure application.
 */

var app = module.exports = express();

app.configure(function() {
	app.engine('ejs', engine);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use('/assets', express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

/**
 * Import routes.
 */

var registration = require('./routes/registration');

/**
 * Map urls and HTTP verbs to routes.
 */

app.map = require('../../app').map;

app.map(app, {
	'/vehicle': {
		'/add': {
			get: profile.form,
			post: profile.add
		},
		'/:vid': {
			get: profile.show,
			'/image': {
				'/:iid': {
					get: profile.sendFile
				}
			},
		}
	},
	'/seller': {
		'/vehicles': {
			get: profile.list
		}
	}
});

