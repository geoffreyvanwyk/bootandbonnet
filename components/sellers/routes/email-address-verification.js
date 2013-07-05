"use strict";

/**
 * Import external modules.
 */

var bcrypt = require('bcrypt');

/**
 * Import local modules.
 */

var email = require('../../../configuration/email').server;

/**
 * Import models.
 */

var Seller = require('../models/sellers').Seller;

/**
 * Import routes.
 */

var main = require('../../../routes/main');

/**
 * Sends an email to a seller to verify the email address provided.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function sendEmail(request, response) {
	var emailAddress = request.session.seller.emailAddress;
	bcrypt.hash(emailAddress, 10, function(err, hash) {
		if (err) {
			console.log(err);
			main.showErrorPage(reques, response);
		} else {
			var link = 'http://localhost:3000/seller/verify-email-address/?emailAddress='
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
 * Responds to HTTP GET /seller/verify-email-address.
 *
 * It checks whether the hash of the email address and the hash in the query string match. It
 * then displays the email-address-verified-page. If the email address does not exist in the database anymore
 * or if the hash does not match the email address, an error message is displayed.
 *
 * @param   {object}	request     An HTTP request object received from the express.get() method.
 * @param   {object}	response    An HTTP response object received from the express.get() method.
 *
 * @returns  {undefined}
 */
function verifyEmailAddress(request, response) {
	var emailAddress = decodeURIComponent(request.query.emailAddress);
	var emailAddressHash = request.query.hash;
	bcrypt.compare(emailAddress, emailAddressHash, function(err, isMatch) {
		if (err) {
			throw err;
		} else if (isMatch) {
			var isSellerLoggedIn = request.session.seller && request.session.seller.loggedIn;
			Seller.findOneAndUpdate({emailAddress: emailAddress}, {
				$set: {
					emailAddressVerified: true
				}
			}, function (err, seller) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else if (!seller) {
					request.session.isSellerNotExist = true;
					showEmailAddressVerifiedPage(request, response);
				} else {
					if (isSellerLoggedIn) {
						request.session.seller.emailAddressVerified = true;
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
 * Displays the email-address-verified page.
 *
 * @param   {object}	request     An HTTP request object received from the express.get() method.
 * @param   {object}	response    An HTTP response object received from the express.get() method.
 *
 * @returns  {undefined}
 */
function showEmailAddressVerifiedPage(request, response) {
	if (request.session.seller && request.query.logout) {
		var loggedIn = false;
		request.session = null;
	} else if (request.session.seller) {
		var loggedIn = true;
	} else {
		var loggedIn = false;
	}
	response.render('email-address-verified-page', {
		isSellerNotExist: request.session.isSellerNotExist || '',
		isHashNotMatch: request.session.isHashNotMatch || '',
		loggedIn: loggedIn
	});
}

module.exports = {
	sendEmail: sendEmail,
	verifyEmailAddress: verifyEmailAddress
};