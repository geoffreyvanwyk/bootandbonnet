
/*
 * GET home page.
 */

var path = require('path');

exports.index = function(request, response) {
	if (request.session.seller && request.query.logout) {
		loggedIn = false;
		request.session = null;
	} else if (request.session.seller) {
		loggedIn = true;
	} else {
		loggedIn = false;
	}
	response.render(path.join(__dirname, '../views/home'), {
		loggedIn: loggedIn
	});
};