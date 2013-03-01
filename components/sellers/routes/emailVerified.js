"use strict";

module.exports = function(request, response) {
	if (request.session.seller && request.query.logout) {
		var loggedIn = false;
		request.session = null;
	} else if (request.session.seller) {
		var loggedIn = true;
	} else {
		var loggedIn = false;
	}
	response.render('emailVerified', {
		loggedIn: loggedIn
	});
};


