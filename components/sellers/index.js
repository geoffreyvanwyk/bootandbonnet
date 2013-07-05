/**
 * HTTP Server Component: sellers
 * 
 * File Name: index.js
 * 
 * Purpose: Used to register new users and log them in.
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

var map = require('../../library/route-map').map;

/**
 * Import routes.
 */

var registration = require('./routes/registration');
var email = require('./routes/email-address-verification');
var login = require('./routes/login');
var password = require('./routes/password-reset');

/**
 * Configure application.
 */

var app = express();

app.configure(function () {
	app.engine('ejs', engine);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
    app.use('/static', express.static('static'));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

/**
 * Map urls and HTTP verbs to routes.
 */

app.map = map;

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

module.exports = {
	app: app
};
