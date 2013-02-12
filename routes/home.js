
/*
 * GET home page.
 */

exports.index = function(request, response) {
    if (request.session.username && request.query.logout) {
	loggedIn = false;
	request.session = null;
    } else if (request.session.username) {
	loggedIn = true;
    } else {
	loggedIn = false;
    }
    response.render('home', {
	loggedIn: loggedIn
    });
};