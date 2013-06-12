"use strict";

/**
 * Handles the login.ejs view.
 */
var mongoose = require('mongoose');
var User = require('../models/users').User;
var PrivateSeller = require('../models/sellers').PrivateSeller;
var Dealership = require('../models/dealerships').Dealership;

var bcrypt = require('bcrypt');	// For hashing and comparing passwords.
var dealershipPrototype = require('../models/dealerships').dealership; // For working with the dealerships database table.
var home = require('../../../routes/home').index;
var townPrototype = require('../../../models/locations').town; // For working with the locations database table.
var profile = require('./profile'); // For creating a seller object as a property of the request.session object.
var sellerPrototype = require('../models/sellers').seller; // For working with the sellers database table.
var userPrototype = require('../models/users').user; // For working with the users database table.

/**
 * Responds to HTTP GET /seller/login. Displays the login form. 
 * 
 * Before displaying the login form, the function checks whether the user is logged-in. If the user is
 * logged-in, the function does nothing, because there is no reason for a logged-in user to see the 
 * login form. In the user interface, there is no way for a logged-in user to request the login form,
 * but a logged-in user might attempt to request it directly via the browser's location bar.
 *
 * @param   {object}    request     An HTTP request object received from the express.get() method.
 * @param   {object}    response    An HTTP response object received from the express.get() method.
 */
function showLoginForm(request, response) {
	var isUserLoggedIn = request.session.user ? true : false;
	if (!isUserLoggedIn) { 
		var isLoginAttempted = request.session.login ? true : false;
		if (isLoginAttempted) { 
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
}

/**
 * Responds to HTTP POST /. Starts a seller's logged-in session.
 *
 * @param   {object}    request     An HTTP request object received from the express.get() method.
 * @param   {object}    response    An HTTP response object received from the express.get() method.
 */
function startLoggedInSession(request, response) {
	var slr = request.body.user;
	mongoose.connect('mongodb://localhost/bootandbonnet');
	mongoose.connection.on('error', console.error.bind(console, 'Error: Failed to connect to MongoDB.'));
	mongoose.connection.once('open', function () {
		User.findOne({emailAddress: slr.emailAddress}, function (err, user) {
			if (!user) {
				request.session.login = {
					emailError: 'The email address has not been registered.',
					email: slr.emailAddress
				};			
			} else {
				bcrypt.compare(slr.password, user.passwordHash, function (err, isMatch) {
					if (isMatch) {
						PrivateSeller.findOne({userId: user._id}, function (err, privateSeller) {
							if (!privateSeller) {
								Dealership.findOne({userId: user._id}, function (err, dealership) {
									mongoose.connection.close();
									var privateSeller = null;
									profile.setSession(request, response, user, dealership, privateSeller, home);	
								});
							} else {
								mongoose.connection.close();
								var dealership = null;
								profile.setSession(request, response, user, dealership, privateSeller, home);
							}
						});				
					} else {
						mongoose.connection.close();
						request.session.login = {
							passwordError: 'The password is wrong.'
						};
						showLoginForm(request, response);					
					}	
				});
			}
		});
	});
}

module.exports = {
	showLoginForm: showLoginForm,
	startLoginSession: startLoggedInSession
};
