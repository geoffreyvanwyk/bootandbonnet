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
		if (request.query.logout) {
			request.session.user = null;
			request.session.seller = null;
		}
		response.render(path.join(__dirname, '../views/home'), {
			isLoggedIn: !!request.session.user,
			userId: request.session.user && request.session.user._id || ''
		});
	},
	showErrorPage: function (request, response) {
		response.render(path.join(__dirname, '../views/error-page'), {
			isLoggedIn: !!request.session.user,
			userId: request.session.user && request.session.user._id || '',
			error: request.session.specialError || 'We apologise for the inconvenience. Please try again later.'
		}, function (err, html) {
			request.session.specialError = null;
			response.send(html);
		});
	}
};
