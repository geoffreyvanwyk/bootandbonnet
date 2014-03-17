/*jshint node: true*/

'use strict';

/**
 * @file routes/password-reset.js
 * @summary Component: Password Reset. Contains routes for resetting a user's password.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import local modules. */
var email = require('../configuration/email').server;

/* Import models. */
var User = require('../models/users');

/* Import routes. */
var login = require('./login');
var main = require('./main');

/**
 * @summary Handles all the errors of the functions in this module.
 *
 * @param {object} err The error object passed from the other functions.
 *
 * @returns {undefined}
 */
var handleErrors = function (err, request, response) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');

	switch (err.message) {
		case 'The email address has not been registered.':
			request.session.passwordForgotError = {
				emailAddress: err.emailAddress,
				message: err.message,
				emailAlertType: 'error'
			};
			password.showForgotForm(request, response);
			break;
		case 'Key does not match hash of the email address. Please try again.':
			request.session.passwordForgot = {
				emailAddress: err.emailAddress,
				message: err.message,
				emailAlertType: 'error'
			};
			password.showForgotForm(request, response);
			break;
		default:
			response.redirect(302, '/error');
			break;
	}
};

var password = module.exports = {
	/**
	 * @summary Responds to HTTP GET /users/password/forgot. Displays the views/password-forgot-form.ejs.
	 *
	 * @description If the passwordForgotError property of the request.session object exists, it means that 
	 * the form is being redisplayed after:
	 *
	 * (1) an unregistered email address has been entered into the password-forgot-form (function sendLink). 
	 * OR
	 * (2) the key in the reset url does not match the hash of the email address (function showResetForm). OR
	 * (3) the user account has been deleted since the reset link was sent (function reset).
	 *
	 * and that an error message must be displayed on the password-forgot form.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showForgotForm: function (request, response) {
		response.render('password-forgot-form', {
			error: request.session.passwordForgotError || {
				emailAddress: '',
				message: '',
				emailAlertType: ''
			},
			isLoggedIn: !!request.session.user
		}, function (err, html) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				request.session.passwordForgotError = null;
				response.send(html);
			}
		});
	},
	/**
	 * @summary Responds to HTTP POST /users/password/forgot. Sends an email message, containing a link to 
	 * the password-reset form (views/password-reset-form.ejs), to the address entered into the password-
	 * forgot form (views/password-forgot-form.ejs); then displays the password-reset-email-sent page
	 * (views/password-reset-email-sent-page.ejs).
	 *
	 * @description Preconditions:
	 * (1) None.
	 *
	 * Postconditions:
	 * (1) See summary.
	 *
	 * Algorithm:
	 * (1) Using the findUser() closure function, it looks for a user document in the users collection in the 
	 * database, associated with the email address entered into the password-forgot form (frmEmailAddress). 
	 * If no user has that email address, the emailError object is passed to the password.showForgotForm 
	 * method, then the password-forgot form is displayed again with an error message.
	 *
	 * If a seller with that email address does exist, the hashEmailAddress() closure function hashes the 
	 * email address.
	 *
	 * The sendMessage() closure function creates link to the password-reset form, containing the email 
	 * address and its hash as query variables; then sends the link to the email address.
	 *
	 * Then the password-reset-email-sent page is displayed.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	sendLink: function (request, response) {
		/* The email address entered into the password-forgot form. */
		var frmEmailAddress = request.body.user.emailAddress.toLowerCase().trim();

		var sendMessage = function (key, callback) {
			/* Link to the password-reset form. */
			var link = 'http://localhost:3000/password/reset?email='
							.concat(encodeURIComponent(frmEmailAddress))
							.concat('&key=')
							.concat(key);

			var message = {
				from: "BootandBonnet <info@bootandbon.net>",
				to: frmEmailAddress,
				subject: "Password Reset",
				text: "Dear Sir/Madam,\n\n"
					.concat("We have received a request for resetting your password. ")
					.concat("If this is correct, please click the following link to reset your password:\n")
					.concat(link)
					.concat('\n\n')
					.concat("If you did not make this request, please ignore this email.\n\n")
					.concat("Thank you,\n")
					.concat("The BootandBonnet Team")
			};

			email.send(message, callback);
		};

		var createKey = function (user, callback) {
			bcrypt.hash(user.emailAddress, 10, function (err, key) {
				if (err) {
					return callback(err);
				}
				sendMessage(key, callback);
			});
		};

		var findUser = function (callback) {
			User.findOne({emailAddress: frmEmailAddress}, function (err, user) {
				if (err) {
					return callback(err);
				}
				if (!user) {
					var error = new Error('The email address has not been registered.');
					error.emailAddress = frmEmailAddress;
					return callback(error);
				}
				createKey(user, callback);
			});
		};

		findUser(function (err, message) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				response.redirect(302, '/password/reset/email-sent');
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /users/password/reset. Displays the password-reset form.
	 *
	 * @description It compares the email address in the query string (qryEmail), with the key in the query
	 * string (qryKey). If the email address matches the hash, the password-reset form is displayed; else, 
	 * the password-forgot form is displayed with an error message.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showResetForm: function (request, response) {
		var qryEmailAddress = decodeURIComponent(request.query.email);
		var qryKey = request.query.key;
		bcrypt.compare(qryEmailAddress, qryKey, function(err, isMatch) {
			if (err) {
				handleErrors(err, request, response);
			} else if (!isMatch) {
				var error = new Error('Key does not match hash of the email address. Please try again.');
				error.emailAddress = qryEmailAddress;
				handleErrors(error, request, response);
			} else {
				response.render('password-reset-form', {
					emailAddress: qryEmailAddress,
					isLoggedIn: !!request.session.user
				});
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /users/password/reset/email-sent. Displays the password-reset-email-
	 * sent page.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showEmailSentPage: function (request, response) {
		response.render('password-reset-email-sent-page', {
			isLoggedIn: !!request.session.user
		});
	},
	/**
	 * @summary Responds to HTTP POST /users/password/reset. Resets the seller's password, then displays 
	 * the login form.
	 *
	 * @description Using the hashPassword() closure function, it hashes the new password entered into the
	 * password-reset form (frmPassword).
	 *
	 * Then, using the updateSeller() closure function, it looks for the seller with the email address with 
	 * which the password-reset form was requested (frmEmail). If such a seller does not exist, it displays 
	 * the password-forgot form with an error message.
	 *
	 * If the seller does exist, it resets the seller's passwordHash to the new hash; then displays the login 
	 * form.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	reset: function (request, response) {
		/* Email address with which the password reset was requested. */
		var frmEmailAddress = request.body.user.emailAddress.toLowerCase().trim();

		/* New password entered into the password-reset form. */
		var frmPassword = request.body.user.password;

		var updateUser = function (hash, callback) {
			User.findOneAndUpdate({
				emailAddress: frmEmailAddress
			}, {
				$set: {
					passwordHash: hash
				}
			}, function (err, user) {
				if (err) {
					return callback(err);
				}
				if(!user) {
					var error = new Error('The email address has not been registered.');
					error.emailAddress = frmEmailAddress;
					return callback(error);
				}
				return callback(null, user);
			});
		};

		var hashPassword = function (callback) {
			bcrypt.hash(frmPassword, 10, function (err, hash) {
				if (err) {
					return callback(err);
				}
				updateUser(hash, callback);
			});
		};

		hashPassword(function (err, user) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				request.session.isPasswordReset = true;
				response.redirect(302, '/login');
			}
		});
	}
};