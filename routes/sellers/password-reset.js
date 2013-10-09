/*jslint node: true */

"use strict";

/*
 * Component: sellers
 *
 * File: routes/sellers/password-reset.js
 *
 * Purpose: Contains routes for resetting a seller's password.
 */

/* Import external modules. */

var bcrypt = require('bcrypt');

/* Import local modules. */

var email = require('../../configuration/email').server;

/* Import models. */

var Seller = require('../../models/sellers/sellers').Seller;

/* Import routes. */

var login = require('./login');
var main = require('../../routes/main');

/**
 * Responds to HTTP GET /seller/password/forgot.
 *
 * Displays the password-forgotten form.
 *
 * If the email address entered into the form does not exist in the database, the form is redisplayed, showing
 * the error. If the passwordReset property of the request.session object exists, it means the error message
 * must be displayed. The property is set in the sendPasswordResetEmail function.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showPasswordForgottenForm(request, response) {
	if (request.session.passwordReset) {
		var emailError = request.session.passwordReset.emailError;
		var emailAddress = request.session.passwordReset.email;
		request.session.passwordReset = null;
	}
	response.render('sellers/password-forgotten-form', {
		emailError: emailError || '',
		emailAddress: emailAddress || '',
		loggedIn: false
	});
}

/**
 * Responds to HTTP POST /seller/password/forgot.
 *
 * Sends an email message containing a link to the password-reset form, to the address entered into the
 * password-forgotten form.
 *
 * If the email address does not exist, the passwordReset property is added to the request.session object, and
 * the password-forgotten form is displayed again. the passwordReset property lets the
 * showPasswordForgottenForm function that the error message should be displayed on the form.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function sendPasswordResetEmail(request, response) {
	var emailAddress = request.body.seller.emailAddress;
	Seller.findOne({emailAddress: emailAddress}, function (err, seller) {
		if (err) {
			console.log(err);
			return main.showErrorPage(request, response);
		} else 	if (!seller) {
			request.session.passwordReset = {
				emailError: err.message,
				email: user.username
			};
			return showPasswordForgottenForm(request, response);
		} else {
			bcrypt.hash(seller.emailAddress, 10, function (err, hash) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					var link = 'http://localhost:3000/seller/password/reset?email='
									.concat(encodeURIComponent(emailAddress))
									.concat('&hash=').concat(hash);
					email.send({
						text: "Dear Sir/Madam,\n\n"
								.concat("We have received a request for resetting your password. ")
								.concat("If this is correct, please click the following link to reset your")
								.concat("password:\n")
								.concat(link).concat('\n\n')
								.concat("If you did not make this request, please ignore this email.\n\n")
								.concat("Thank you,\n")
								.concat("The BootandBonnet Team"),
						from: "BootandBonnet <info@bootandbon.net>",
						to: emailAddress,
						subject: "Password Reset"
					}, function(err, message) {
						console.log(err || message);
						response.render('sellers/password-reset-email-sent-page', {
							loggedIn: false
						});
					});
				}
			});
		}
	});
}

/**
 * Responds to HTTP GET /seller/password/reset.
 *
 * Displays the password-reset form.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showPasswordResetForm(request, response) {
	var emailAddress = decodeURIComponent(request.query.email);
	var emailHash = request.query.hash;
	bcrypt.compare(emailAddress, emailHash, function(err, isMatch) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else if (isMatch) {
			response.render('sellers/password-reset-form', {
				emailAddress: emailAddress,
				loggedIn: false
			});
		}
	});
}

/**
 * Responds to HTTP POST /seller/password/reset.
 *
 * Stores the seller's new password in the database, then displays the login form.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function resetPassword (request, response) {
	var emailAddress = request.body.seller.emailAddress;
	var password = request.body.seller.password;
	bcrypt.hash(password, 10, function(err, passwordHash) {
		if (err) {
			console.log(err);
			return main.showErrorPage(request, response);
		} else {
			Seller.findOneAndUpdate({emailAddress: emailAddress}, {
				$set: {
					passwordHash: passwordHash
				}
			}, function (err, seller) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else {
					request.session.isPasswordReset = true;
					return login.showLoginForm(request, response);
				}
			});
		}
	});
}

module.exports = {
	showPasswordForgottenForm: showPasswordForgottenForm,
	sendPasswordResetEmail: sendPasswordResetEmail,
	showPasswordResetForm: showPasswordResetForm,
	resetPassword: resetPassword
};