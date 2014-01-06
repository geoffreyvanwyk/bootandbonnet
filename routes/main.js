/*jshint node: true*/

'use strict';

/**
 * @file routes/main.js
 * @summary Component: main. Displays the home-page and the error page.
 */

/* Import built-in modules. */
var path = require('path');

module.exports = {
	showHomePage: function (request, response) {
		if (request.query.logout) {
			request.session.user = null;
			request.session.seller = null;
		}
		response.render('home-page', {
			isLoggedIn: !!request.session.user,
			seller: request.session.seller || {_id: ''}
		});
	},
	showErrorPage: function (request, response) {
		response.render('error-page', {
			isLoggedIn: !!request.session.user,
			seller: request.session.seller || {id: ''},
			error: request.session.specialError || 'We apologise for the inconvenience. Please try again later.'
		}, function (err, html) {
			request.session.specialError = null;
			response.send(html);
		});
	}
};
