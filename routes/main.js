"use strict";

/**
 * Displays the home-page.
 */

var path = require('path');

function showHomePage(request, response) {
	if (request.session.seller && request.query.logout) {
		request.session = null;
		var loggedIn = false;
	} else if (request.session.seller) {
		var loggedIn = true;
	} else {
		var loggedIn = false;
	}
	response.render(path.join(__dirname, '../views/home'), {
		loggedIn: loggedIn 
	});
};

function showErrorPage(request, response) {
	response.render(path.join(__dirname, '../views/error-page'), {
		loggedIn: request.session.seller ? true : false 
	});
}

module.exports = {
	showHomePage: showHomePage,
	showErrorPage: showErrorPage
};