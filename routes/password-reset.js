/*jshint node: true*/

'use strict';

/**
 * @file routes/password-reset.js
 * Component: users
 * Purpose: Contains routes for resetting a user's password.
 */

/* Import external modules. */
var bcrypt = require('bcrypt');

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
var handleErrors = function (err) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');
	main.showErrorPage(request, response);
};

var password = module.exports = {
	/**
	 * @summary Responds to HTTP GET /password/forgot. Displays the password-forgot form.
	 *
	 * @description If the passwordForgot property of the request.session object exists, it means that the form is
	 * being redisplayed after
	 *
	 * 1) an unregistered email address has been entered into the password-forgot-form, or that
	 * 2) the user account has been deleted since the reset link was sent,
	 *
	 * and that an error message must be displayed on the password-forgot form.
	 *
	 * In the first case, the passwordForgot property is set in the sendLink function, and, in the second case, in the
	 * reset function.
	 *
	 * If the emailHashMismatch property of the request.session object exists, it means that the email address in
	 * the password-reset link did not match the hash in the link, and that the an error message must be displayed
	 * on the password-forgot form. The property is set in the showResetForm function.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showForgotForm: function (request, response) {
		response.render('password-forgot-form', {
			emailAddress: request.session.passwordForgot.emailAddress || '',
			emailError: request.session.passwordForgot.emailError || request.session.emailHashMismatch || '',
			emailAlertType: request.session.passwordForgot.emailError || request.session.emailHashMismatch ? 'error' : '',
			isLoggedIn: false
		}, function (err, html) {
			if (err) {
				handleErrors(err);
			} else {
				request.session.passwordForgot = null;
				request.session.emailHashMismatch = null;
				response.send(html);
			}
		});
	},
	/**
	 * @summary Responds to HTTP POST /password/forgot. Sends an email message, containing a link to the
	 * password-reset form, to the address entered into the password-forgot form; then displays the
	 * password-reset-email-sent page.
	 *
	 * @description First, using the findSeller() closure function, it looks for a seller in the sellers database
	 * collection, with the email address entered into the password-forgot form (frmEmailAddress). If no seller has that email
	 * address, the passwordForgot object is added as a property to the request.session object, then the
	 * password-forgot form is displayed again with an error message.
	 *
	 * If a seller with that email address does exist, the hashEmailAddress() closure function hashes the email address.
	 *
	 * The sendMessage() closure function creates link to the password-reset form, containing the email address and its
	 * hash as query variables; then sends the link to the email address.
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
		var frmEmailAddress = request.body.seller.emailAddress.toLowerCase().trim();

		var sendMessage = function (hash, callback) {
			/* Link to the password-reset form. */
			var link = 'http://localhost:3000/password/reset?email='
							.concat(encodeURIComponent(frmEmail))
							.concat('&hash=')
							.concat(hash);

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

		var hashEmailAddress = function (user, callback) {
			bcrypt.hash(user.emailAddress, 10, function (err, hash) {
				if (err) {
					return callback(err);
				}
				sendMessage(hash, callback);
			});
		};

		var findUser = function (callback) {
			User.findOne({emailAddress: frmEmailAddress}, function (err, user) {
				if (err) {
					return callback(err);
				}
				if (!user) {
					var err = new Error('The email address has not been registered.');
					err.emailAddress = frmEmailAddress;
					return callback(err);
				}
				hashEmailAddress(seller, callback);
			});
		};

		findUser(function (err, message) {
			if (err && err.name === 'EmailError') {
				request.session.passwordForgot = {
					emailAddress: frmEmail,
					emailError: 'The email address has not been registered.'
				};
				password.showForgotForm(request, response);
			} else if (err) {
				console.log('==================== BEGIN ERROR MESSAGE ====================');
				console.log(err);
				console.log('==================== END ERROR MESSAGE ======================');
				main.showErrorPage(request, response);
			} else {
				response.render('password-reset-email-sent-page', {
					isLoggedIn: false
				});
			}
		});

	},
	/**
	 * @summary Responds to HTTP GET /password/reset. Displays the password-reset form.
	 *
	 * @description It compares the email address in the query string (qryEmail), with the hash in the query
	 * string (qryHash). If the email address matches the hash, the password-reset form is displayed; else, the
	 * password-forgot form is displayed with an error message.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showResetForm: function (request, response) {
		var qryEmail = decodeURIComponent(request.query.email);
		var qryHash = request.query.hash;
		bcrypt.compare(qryEmail, qryHash, function(err, isMatch) {
			if (err) {
				handleErrors(err);
			} else if (isMatch) {
				response.render('password-reset-form', {
					emailAddress: qryEmail,
					isLoggedIn: false
				});
			} else {
				request.session.emailHashMismatch = {
					emailError: 'The email address does not match its hash code. Please try again.'
				};
				password.showForgotForm(request, response);
			}
		});
	},
	/**
	 * @summary Responds to HTTP POST /password/reset. Resets the seller's password, then displays the login form.
	 *
	 * @description Using the hashPassword() closure function, it hashes the new password entered into the
	 * password-reset form (frmPassword).
	 *
	 * Then, using the updateSeller() closure function, it looks for the seller with the email address with which the
	 * password-reset form was requested (frmEmail). If such a seller does not exist, it displays the password-forgot
	 * form with an error message.
	 *
	 * If the seller does exist, it resets the seller's passwordHash to the new hash; then displays the login form.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	reset: function (request, response) {
		/* Email address with which the password reset was requested. */
		var frmEmailAddress = request.body.seller.emailAddress.toLowerCase().trim();

		/* New password entered into the password-reset form. */
		var frmPassword = request.body.seller.password;

		var updateUser = function (hash, callback) {
			User.findOneAndUpdate({
				emailAddress: frmEmailAddress
			}, {
				$set: {
					passwordHash: hash
				}
			}, callback);
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
				handleErrors(err);
			} else {
				request.session.isPasswordReset = true;
				login.showForm(request, response);
			}
		});
	}
};