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

app.configure(function () {
	app.engine('ejs', engine);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use('/assets', express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

/**
 * Import routes.
 */

var registration = require('./routes/registration');
var email = require('./routes/email-address-verification');
var login = require('./routes/login');
var password = require('./routes/password-reset');

/**
 * Map urls and HTTP verbs to routes.
 */

app.map = require('../../app').map;

app.map(app, {
	'/seller': {
		'/add': {
			get: registration.showRegistrationForm,
			post: registration.validateInputs
		},
		'/view': {
			get: registration.showProfile
		},
		'/edit': {
			get: registration.showRegistrationForm,
			post: registration.validateInputs
		},
		'/remove': {
			get: registration.removeProfile
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
		}
	}
});
