"use strict";
/*
 * GET home page.
 */

var path = require('path'); // For handling file paths.

exports.index = function showHomePage(request, response) {
	if (request.session.seller && request.query.logout) {
		var loggedIn = false;
		request.session = null;
	} else if (request.session.seller) {
		var loggedIn = true;
	} else {
		var loggedIn = false;
	}
	response.render(path.join(__dirname, '../views/home'), {
		loggedIn: loggedIn
	});
};
