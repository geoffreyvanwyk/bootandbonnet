/*jshint node: true*/

'use strict';

/*
 * Component: main
 *
 * File: routes/main.js
 *
 * Purpose: Displays the home-page and the error page.
 */

/* Import built-in modules. */
var path = require('path');

module.exports = {
	showHomePage: function (request, response) {
		var locals;
		if (request.query.logout) {
			request.session = null;
		} 
		if (request.session && request.session.seller) {
			locals = {
				isLoggedIn: true,
				sellerId: request.session.seller._id
			};
		} else {
			locals = {
				isLoggedIn: false,
				sellerId: ''
			};
		}
		response.render(path.join(__dirname, '../views/home'), locals);
	},
	showErrorPage: function (request, response) {
		var locals;
		if (request.session && request.session.seller) {
			locals = {
				isLoggedIn: true,
				sellerId: request.session.seller._id
			};
		} else {
			locals = {
				isLoggedIn: false,
				sellerId: ''
			};
		}
		response.render(path.join(__dirname, '../views/error-page'), locals);
	}
};
