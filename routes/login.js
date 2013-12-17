/*jshint node: true*/

'use strict';

/**
 * @file routes/login.js
 * @summary Component: Login. Contains routes that handle user login.
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
		loginErrors = {
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
			loginErrors.emailError = err.message;
			login.showForm(request, response, loginErrors);
			break;
		case 'The password is wrong.':
			loginErrors.passwordError = err.message;
			login.showForm(request, response, loginErrors);
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

/**
 * @summary Returns true, if a user is logged-in; false, otherwise.
 *
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {boolean}
 */
var isLoggedIn = function (request, response) {
	var displayError = function () {
		handleErrors(new Error('You are already logged-in.'), request, response);
		return false;
	}
	return !!request.session.user || displayError();
}

var login = module.exports = {
	/**
	 * @summary Responds to HTTP GET /login. Displays the login-form.
	 *
	 * @description Preconditions:
	 * (1) The user must not be logged-in (function isLoggedIn).
	 *
	 * There is no reason for a logged-in user to see the log-in form. In the user interface, there is no way for a
	 * logged-in user to request the login-form, but a logged-in user might attempt to request it directly via the
	 * browser's location bar.
	 *
	 * Postconditions:
	 * (1) The views/login-form.ejs is displayed.
	 *
	 * Error handling:
	 * (1) If the user is logged-in, the function displays the error-page, because there is no reason for a
	 * logged-in user to see the login-form (function isLoggedIn()).
	 *
	 * (2) If a log-in attempt fails, in other words, if the user enters an email address that is not in the database,
	 * or if the password is wrong, the login-form is displayed again, but this time with appropriate error messages. If
	 * the loginErrors parameter is not null or undefined, it means that a log-in attempt has failed. The
	 * loginErrors argument is passed by the authenticate function.
	 *
	 * (3) After a user has reset his password, the login form is shown to him, with a banner message across the top
	 * of the form, telling him that the password reset was successful, and that he may log-in again. If the
	 * isPasswordReset property of the request.session object is true, the banner is displayed. The isPasswordReset
	 * property of the request.session object is set in the resetPassword function of the password-reset module.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showForm: function (request, response, loginErrors) {
		if (!isLoggedIn(request, response)) {
			response.render('login-form', {
				loginErrors: loginErrors || {
					emailAddress: '',
					emailError: '',
					emailAlertType: '',
					password: '',
					passwordError: '',
					passwordAlertType: ''
				},
				resetDisplay: request.session.isPasswordReset ? '' : 'none',
				isLoggedIn: false
			});
		}
	},
	/**
	 * @summary Responds to HTTP POST /login. Authenticates the user, logs-in the user, then displays the home
	 * page.
	 *
	 * @description Preconditions:
	 * (1) The user is not logged-in (function isLoggedIn()).
	 *
	 * Postconditions:
	 * (1) The authenticated user (and seller) is logged-in by setting the session cookies (request.session.user;
	 * request.session.seller).
	 * (2) The home page is displayed.
	 *
	 * Algorithm:
	 * The user is authenticated by taking the following steps:
	 * 1) Use the findUser() closure function to check whether there is any user in the users database
	 * collection with the email address entered into the login form.
	 *
	 * 2) If there is such a user, use the comparePassword() closure function to hash the password entered into the
	 * login form, then compare the hash with the passwordHash of the user from the database.
	 *
	 * 3) If the hashes are the same, use the findSeller() closure function to retrieve the seller object
	 * associated with the user, if any.
	 *
	 * Error handling:
	 * (1) If the user is logged-in, the function displays the error-page, because there is no reason for a
	 * logged-in user to see the login-form (function isLoggedIn()).
	 *
	 * (2) If the email address does not exist in the database, or if the password is wrong, the handleErrors() function
	 * is called to redisplay the login-form with the errors.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	authenticate: function (request, response) {
		if (isLoggedIn(request, response)) {
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
					handleErrors(err, request, response);
				} else {
					request.session.user = {
						_id: user._id,
						emailAddress: user.emailAddress,
						isEmailAddressVerified: user.isEmailAddressVerified
					};
					if (seller) { // The new user might not be a seller; might be an administrator.
						request.session.seller = seller;
					}
					main.showHomePage(request, response);
				}
			});
		}
	}
};