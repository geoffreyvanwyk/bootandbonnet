/*jshint node: true*/

'use strict';

/**
 * @file routes/email-address-verification.js
 * @summary Component: Users. Contains routes for verifying the email addresses of users.
 * @description A user's email address must be verified to prevent spam accounts.
 * Algorithm:
 * (1) A key is created by hashing the user's email address with a random salt.
 * (2) The hashing function automatically stores the salt in the first set of characters of the key.
 * (3) The key and the email address are emebedded in a link back to the web site.
 * (4) The link is emailed to the user.
 * (5) When the user clicks the link, the the email address in the link is hashed, using the salt which is part of the
 * key in the link.
 * (6) The new key is compared with the key in the link.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing email addresses, and comparing hashes.

/* Import local modules. */
var email = require('../configuration/email').server;

/* Import models. */
var User = require('../models/users');

/* Import routes. */
var main = require('../routes/main');

/**
 * @summary Handles all the errors in this module.
 *
 * @param {object} err An Error object.
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
var handleErrors = function (err, request, response) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');

	var isKeyError = err.message === 'Key does not match hash of email address.';
	var isUserError = err.message === 'No user associated with that email address.';

	var verificationErrors = {};

	if (isKeyError) {
		verificationErrors.keyError = err.message;
		showVerifiedPage(request, response, verificationErrors);
	} else if (isUserError) {
		verificationErrors.userError = err.message;
		showVerifiedPage(request, response, verificationErrors);
	} else {
		main.showErrorPage(request, response);
	}
};

/**
 * @summary Displays the views/email-address-verified-page.ejs.
 *
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
var showVerifiedPage = function (request, response, verificationErrors) {
	response.render('email-address-verified-page', {
		verificationErrors: verificationErrors,
		isLoggedIn: !!request.session.user;
	});
};

var verify = module.exports = {
	/**
	 * @summary Sends an email message, containing a link back to the web site, to the user. The user must click the
	 * link to verify that he/she owns the email address.
	 *
	 * @description The query string of the link contains user's id, the email address and a verification key. The key
	 * is created by hashing the email address together with a random salt.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	sendEmail: function (request, response) {
		var emailAddress = request.session.user.emailAddress;
		var userId = request.params.userId;
		bcrypt.hash(emailAddress, 10, function(err, key) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				var link = 'http://localhost:3000/user/'
								.concat(encodeURIComponent(userId))
								.concat('/verify-email-address/?emailAddress=')
								.concat(encodeURIComponent(emailAddress))
								.concat('&key=')
								.concat(key);
				email.send({
					text: "Dear Sir/Madam,\n\n"
							.concat("Thank you for registering a BootandBonnet account.\n\n")
							.concat("In order to guarantee receiving important future emails regarding your account, ")
							.concat("you must verify your email address. ")
							.concat("Please click the following link to verify your email address:\n\n")
							.concat(link).concat('\n\n')
							.concat("Thank you,\n")
							.concat("The BootandBonnet Team"),
					from: "BootandBonnet <info@bootandbon.net>",
					to: emailAddress,
					subject: "Email Verification"
				}, function(err, message) {
					if (err) {
						handleErrors(err, request, response);
					}
				});
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /user/:userId/verify-email-address. Verifies email address; then displays the
	 * email-address-verified-page.
	 *
	 * @description The query string contains the id of a user, an email address and a key.
	 * Post conditions:
	 * (1) The isEmailAddressVerified property of the user document  in the users database collection, associated with
	 * the email address is updated to true.
	 * (2) If the user is logged-in, the isEmailAddressVerified property of the user session cookie
	 * (request.session.user) is updated to true.
	 * (3) The views/email-address-verified-page.ejs is displayed.
	 *
	 * Algorithm:
	 * (1) Hash the email address together with the salt stored in the key.
	 * (2) Compare the hash with the key.
	 * (3) If they match, the user document associated with the email address is retrieved from the users database
	 * collection.
	 * (4) The isEmailAddressVerified property of that user document is updated to true.
	 *
	 * Error handling:
	 * (1) If the key does not match the hash of the email addres, or if no user is associated with the email address,
	 * the views/email-address-verification-page.ejs is displayed with the error (function handleErrors).
	 * (2) All errors are handled by function handleErrors().
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	verifyEmailAddress: function (request, response) {
		var emailAddress = decodeURIComponent(request.query.emailAddress);
		var key = request.query.key;
		var isLoggedIn = !!request.session.user;

		var updateUser = function (callback) {
			User.findOneAndUpdate({emailAddress: emailAddress}, {
				$set: {
					isEmailAddressVerified: true
				}
			}, function (err, user) {
				if (err) {
					return callback(err);
				}
				if (!user) {
					var err = new Error('No user associated with that email address.');
					return callback(err);
				}
				return callback(null);
			});
		}

		var verifyKey = function (callback) {
			bcrypt.compare(emailAddress, key, function(err, isMatch) {
				if (err) {
					return callback(err);
				}
				if (!isMatch) {
					var err = new Error('Key does not match hash of email address.');
					return callback(err);
				}
				updateUser();
			});
		};

		verifyKey(function (err) {
			if (err) {
				handleErrors(err, request, response);
			} else
				if (isLoggedIn) {
					request.session.user.isEmailAddressVerified = true;
				}
				showVerifiedPage(request, response);
			}
		});
	}
};
