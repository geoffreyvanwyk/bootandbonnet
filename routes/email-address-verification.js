/*jshint node: true*/

'use strict';

/**
 * @file routes/email-address-verification.js
 * Component: users
 * Purpose: Contains routes for verifying the email addresses of users.
 */

/* Import external modules. */
var bcrypt = require('bcrypt');

/* Import local modules. */
var email = require('../configuration/email').server;

/* Import models. */
var User = require('../models/users');

/* Import routes. */
var main = require('../routes/main');

/**
 * @summary Sends an email to a user to verify the email address provided.
 *
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
function sendEmail(request, response) {
	var emailAddress = request.session.user.emailAddress;
	var sellerId = request.params.userId;
	bcrypt.hash(emailAddress, 10, function(err, hash) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			var link = 'http://localhost:3000/user/'
							.concat(encodeURIComponent(userId))
							.concat('/verify-email-address/?emailAddress=')
							.concat(encodeURIComponent(emailAddress))
							.concat('&hash=')
							.concat(hash);
			email.send({
				text: "Dear Sir/Madam,\n\n"
						.concat("Thank you for registering a BootandBonnet account.\n\n")
						.concat("In order to guarantee receiving important future emails regarding your ")
						.concat("account, you must verify your email address. ")
						.concat("Please click the following link to verify your email address:\n\n")
						.concat(link).concat('\n\n')
						.concat("Thank you,\n")
						.concat("The BootandBonnet Team"),
				from: "BootandBonnet <info@bootandbon.net>",
				to: emailAddress,
				subject: "Email Verification"
			}, function(err, message) {
				console.log(err || message);
			});
		}
	});
}

/**
 * @summary Responds to HTTP GET /user/:userId/verify-email-address. Verifies email address; then displays the
 * email-address-verified-page.
 *
 * @description It checks whether the hash of the email address in the query string matches the hash in the query
 * string. If they match, the email-address-verified-page is displayed; else, the same page is displayed, but with an
 * error message.
 *
 * Then it checks
 * whether the email address exists in the database. hen it
 * displays the email-address-verified-page. If the email address does not exist in the database anymore
 * or if the hash does not match the email address, an error message is displayed.
 *
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
function verifyEmailAddress(request, response) {
	var emailAddress = decodeURIComponent(request.query.emailAddress);
	var emailAddressHash = request.query.hash;
	var isLoggedIn = request.session.user;
	bcrypt.compare(emailAddress, emailAddressHash, function(err, isMatch) {
		if (err) {
			throw err;
		} else if (isMatch) {
			User.findOneAndUpdate({emailAddress: emailAddress}, {
				$set: {
					emailAddressVerified: true
				}
			}, function (err, user) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else if (!seller) {
					request.session.isUserNotExist = true;
					showEmailAddressVerifiedPage(request, response);
				} else {
					if (isLoggedIn) {
						request.session.user.emailAddressVerified = true;
					}
					showEmailAddressVerifiedPage(request, response);
				}
			});
		} else {
			request.session.isHashNotMatch = true;
			showEmailAddressVerifiedPage(request, response);
		}
	});
}

/**
 * @summary Displays the email-address-verified page.
 *
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
function showEmailAddressVerifiedPage(request, response) {
	var isLoggedIn;
	if (request.session.user && request.query.logout) {
		isLoggedIn = false;
		request.session = null;
	} else if (request.session.seller) {
		isLoggedIn = true;
	} else {
		isLoggedIn = false;
	}
	response.render('sellers/email-address-verified-page', {
		isUserNotExist: request.session.isUserNotExist || '',
		isHashNotMatch: request.session.isHashNotMatch || '',
		isLoggedIn: isLoggedIn
	});
}

module.exports = {
	sendEmail: sendEmail,
	verifyEmailAddress: verifyEmailAddress
};
