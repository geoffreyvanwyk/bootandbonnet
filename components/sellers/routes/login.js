"use strict";

/**
 * Handles the login.ejs view.
 */

var bcrypt = require('bcrypt');	// For hashing and comparing passwords.
var dealership = require('../models/dealerships').dealership; // For working with the dealerships database table.
var home = require('../../../routes/home').index;
var location = require('../../../models/locations').location; // For working with the locations database table.
var profile = require('./profile').profile; // For creating a seller object as a property of the request.session object.
var seller = require('../models/sellers').seller; // For working with the sellers database table.
var user = require('../models/users').user; // For working with the users database table.

var login = exports.login = {
	/**
	 * Responds to HTTP GET /seller/login. Displays the login form.
	 * 
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 */
	show: function(request, response) {
		if (!request.session.seller) {
			if (request.session.login) {
				var email = request.session.login.email;
				var emailError = request.session.login.emailError;
				var passwordError = request.session.login.passwordError;
				request.session.login = null;
			}
			response.render('login', {
				email: email || '',
				emailError: emailError || '',
				passwordError: passwordError || '',
				loggedIn: false
			});
		}
	},
	/**
	 * Responds to HTTP POST /. Starts a seller's logged-in session.
	 * 
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 */
	start: function(request, response) {
		var slr = request.body.seller;
		user.read(slr.email, function(err, theUser) {
			if (err && err.message === 'The email address has not been registered.') {
				request.session.login = {
					emailError: err.message,
					email: slr.email
				};
				login.show(request, response);
			} else if (err) {
				throw err;
			} else {
				bcrypt.compare(slr.password, theUser.passwordHash, function(err, isMatch) {
					if (err) {
						throw err;
					} else {
						switch (isMatch) {
							case true:
								seller.read(theUser.id, function(err, theSeller) {
									if (err) {
										throw err;
									} else {
										dealership.read(theSeller.dealershipId, function(err, theDealership) {
											if (err) {
												throw err;
											} else {
												location.read(theDealership.locationId, function(err, theLocation) {
													if (err) {
														throw err;
													} else {
														theDealership.province = theLocation.province;
														theDealership.town = theLocation.town;
														profile.createSessionSeller(request, response, theUser,
																theSeller, theDealership, home);
													}
												});
											}
										});
									}

								});
								break;
							case false:
								request.session.login = {
									passwordError: 'The password is wrong.'
								};
								login.show(request, response);
								break;
						}

					}
				});
			}

		});
	}
};
