"use strict";

/**
 * Handles the login.ejs view.
 */

var bcrypt = require('bcrypt');	// For hashing and comparing passwords.
var dealershipPrototype = require('../models/dealerships').dealership; // For working with the dealerships database table.
var home = require('../../../routes/home').index;
var townPrototype = require('../../../models/locations').town; // For working with the locations database table.
var profile = require('./profile'); // For creating a seller object as a property of the request.session object.
var sellerPrototype = require('../models/sellers').seller; // For working with the sellers database table.
var userPrototype = require('../models/users').user; // For working with the users database table.

var login = module.exports.login = {
	/**
	 * Responds to HTTP GET /seller/login. Displays the login form.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 */
	show: function(request, response) {
		if (!request.session.seller) { // If the seller is not logged-in.
			if (request.session.login) { // If a log-in attempt has been made.
				var email = request.session.login.email;
				var emailError = request.session.login.emailError;
				var passwordError = request.session.login.passwordError;
				request.session.login = null;
			}
			if (request.session.isPasswordReset) { // Has a password been reset recently?
				var isPasswordReset = request.session.isPasswordReset;
				request.session.isPasswordReset = null;
			}
			response.render('login', {
				email: email || '',
				emailError: emailError || '',
				passwordError: passwordError || '',
				isPasswordReset: isPasswordReset || false,
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
		var user = Object.create(userPrototype);
		user.username = slr.email;
		user.read(function(err, user) {
			if (err && err.message === 'The email address has not been registered.') {
				request.session.login = {
					emailError: err.message,
					email: slr.email
				};
				login.show(request, response);
			} else if (err) {
				throw err;
			} else {
				bcrypt.compare(slr.password, user.passwordHash, function(err, isMatch) {
					if (err) {
						throw err;
					} else {
						switch (isMatch) {
							case true:
								var seller = Object.create(sellerPrototype);
								seller.userId = user.id;
								seller.read(function(err, seller) {
									if (err) {
										throw err;
									} else {
										var dealership = Object.create(dealershipPrototype);
										dealership.id = seller.dealershipId;
										dealership.read(function(err, dealership) {
											if (err) {
												throw err;
											} else {
												var town = Object.create(townPrototype);
												town.id = dealership.locationId;
												town.read(function(err, town) {
													if (err) {
														throw err;
													} else {
														dealership.province = town.province;
														dealership.town = town.name;
														profile.setSession(request, response, user, dealership, seller, home);
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
