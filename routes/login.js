/*jshint node: true*/

'use strict';

/**
 * @file routes/login.js
 * Component: users
 * Purpose: Contains routes that handle user login.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import models. */
var User = require('../models/users');
var Seller = require('../models/sellers');

/* Import routes. */
var main = require('../routes/main');

/**
 * @summary Handles all the errors of the functions in this module.
 *
 * @param {object} err The error object passed from the other functions.
 * @param {object} user A user object consisting of the email address and password entered into the login form.
 *
 * @returns {undefined}
 */
var handleErrors = function (err, user) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');
	if (err.user) {
		request.session.loginError = {
			emailAddress: err.user.emailAddress,
			emailError: '',
			emailAlertType: 'error',
			password: err.user.password,
			passwordError: '',
			passwordAlertType: 'error'
		};
	}
	switch (err.message) {
		case 'The email address has not been registered.':
			request.session.loginError.emailError = err.message;
			login.showForm(request, response);
			break;
		case 'The password is wrong.':
			request.session.loginError.passwordError = err.message;
			login.showForm(request, response);
			break;
		case 'You are already logged-in':
			request.session.specialError = err.message;
			main.showErrorPage(request, response);
			break;
		default:
			main.showErrorPage(request, response);
			break;
	}
};

var login = module.exports = {
	/**
	 * @summary Responds to HTTP GET /login. Displays the login-form, unless the user is logged-in, in which case the
	 * error-page is displayed.
	 *
	 * @description If the user is logged-in, the function displays the error-page, because there is no reason for a
	 * logged-in user to see the login-form. In the user interface, there is no way for a logged-in user to request the
	 * login-form, but a logged-in user might attempt to request it directly via the browser's location bar.
	 *
	 * If a log-in attempt fails, in other words, if the user enters an email address that is not in the database, or
	 * if the password is wrong, the login-form is displayed again, but this time with appropriate error messages. If
	 * the loginError property of the request.session object exists, it means that a log-in attempt has failed. The
	 * loginError property of the request.session object is set in the authenticate function.
	 *
	 * After a user has reset his password, the login form is shown to him, with a banner message across the top
	 * of the form, telling him that the password reset was successful, and that he may log-in again. If the
	 * isPasswordReset property of the request.session object is true, the banner is displayed. The isPasswordReset
	 * property of the request.session object is set in the resetPassword function of the password-reset module.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showForm: function (request, response) {
		var isLoggedIn = request.session.user;
		if (isLoggedIn) {
			handleErrors(new Error('You are already logged-in.'));
		} else {
			response.render('login-form', {
				loginError: request.session.loginError || {
					emailAddress: '',
					emailError: '',
					emailAlertType: '',
					password: '',
					passwordError: '',
					passwordAlertType: ''
				},
				resetDisplay: request.session.isPasswordReset ? '' : 'none',
				isLoggedIn: false
			}, function (err, html) {
				if (err) {
					handleErrors(err);
				} else {
					request.session.loginError = null;
					request.session.isPasswordReset = false;
					response.send(html);
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP POST /login. Authenticates the user, logs-in the user, then displays the home
	 * page.
	 *
	 * @description The user is authenticated by taking the following steps:
	 *
	 * 1) Use the findUser() closure function to check whether there is any user in the users database
	 * collection with the email address entered into the login form.
	 *
	 * 2) If there is such a user, use the comparePassword() closure function to hash the password entered into the
	 * login form, then compare the hash with the passwordHash of the user from the database.
	 *
	 * 3) If the hashes are the same, use the findSeller() closure function to retrieve the seller object
	 * associated with the user, if any.
	 *
	 * After authentication, the user is logged-in by adding a user property to the request.session object,
	 * then assigning the user object to it. If the user has an associated seller object, the seller object is assigned
	 * to the seller property of the request.session object.
	 *
	 * Finally, the home page is displayed by calling the main.showHomePage() function.
	 *
	 * If the email address does not exist in the database, or if the password is wrong, the handleErrors() function
	 * is called to redisplay the login-form with the errors.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	authenticate: function (request, response) {
		/* User object consisting of the email address and password entered into the login-form. */
		var frmUser = request.body.user;

		/* Email address entered into the login-form. */
		var frmEmailAddress = frmUser.emailAddress.toLowerCase().trim();

		/* Password entered into the login-form. */
		var frmPassword = frmUser.password;

		var findSeller = function (user, callback) {
			Seller.findOne({user: user._id}, function (err, seller) {
				if (err) {
					return callback(err);
				}
				return callback(null, user, seller);
			});
		};

		var comparePassword = function (user, callback) {
			bcrypt.compare(frmPassword, user.passwordHash, function (err, isMatch) {
				if (err) {
					return callback(err);
				}
				if (isMatch) {
					findSeller(user, callback);
				} else {
					var err = new Error('The password is wrong.');
					err.user = frmUser;
					return callback(err);
				}
			});
		};

		var findUser = function (callback) {
			User.findOne({emailAddress: frmEmailAddress}, function (err, user) {
				if (err) {
					return callback(err);
				}
				if (!user) {
					var err = new Error('The email address has not been registered.');
					err.user = frmUser;
					return callback(err);
				}
				comparePassword(user, callback);
			});
		};

		findUser(function (err, user, seller) {
			if (err) {
				handleErrors(err);
			} else {
				request.session.user = user;
				if (seller) {
					request.session.seller = seller;
				}
				main.showHomePage(request, response);
			}
		});
	}
};