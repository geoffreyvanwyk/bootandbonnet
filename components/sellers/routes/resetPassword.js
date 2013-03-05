"use strict";

var bcrypt = require('bcrypt');
var email = require('../../../email').email;
var login = require('./login').login;
var user = require('../models/users').user;

var resetPassword = module.exports.resetPassword = {
	showForgot: function(request, response) {
		if (request.session.passwordReset) {
			var emailError = request.session.passwordReset.emailError;
			var emailAddress = request.session.passwordReset.email;
			request.session.passwordReset = null;
		}
		response.render('forgotPassword', {
			emailError: emailError || '',
			email: emailAddress || '',
			loggedIn: false
		});
	},
	sendEmail: function(request, response) {
		var emailAddress = request.body.seller.email;
		user.read(emailAddress, function(err, theUser) {
			if (err && err.message === 'The email address has not been registered.') {
				request.session.passwordReset = {
					emailError: err.message,
					email: emailAddress
				};
				resetPassword.showForgot(request, response);
			} else if (err) {
				throw err;
			} else {
				bcrypt.hash(emailAddress, 10, function(err, hash) {
					if (err) {
						throw err;
					} else {
						var link = 'http://localhost:3000/seller/login/password/reset?email='.concat(encodeURIComponent(emailAddress)).concat('&hash=').concat(hash);
						email.send({
							text: "Dear Sir/Madam,\n\n\
We have received a request for resetting your password.\n\n\
If this is correct, please click the following link to reset your password:\n"
								.concat(link).concat('\n\n')
								.concat("\
If you did not make this request, please ignore this email.\n\n\
Thank you,\n\
The BootandBonnet Team"),
							from: "BootandBonnet <info@bootandbon.net>",
							to: emailAddress,
							subject: "Password Reset"
						}, function(err, message) {
							console.log(err || message);
							response.render('resetEmailSent', {
								loggedIn: false
							});
						});
					}
				});
			}
		});
	},
	showReset: function(request, response) {
		var emailAddress = decodeURIComponent(request.query.email);
		var emailHash = request.query.hash;
		bcrypt.compare(emailAddress, emailHash, function(err, isMatch) {
			if (err) {
				throw err;
			} else if (isMatch) {
				response.render('resetPassword', {
					email: emailAddress,
					loggedIn: false
				});
			}
		});
	},
	reset: function(request, response) {
		var slr = request.body.seller;
		console.log(slr);
		bcrypt.hash(slr.password, 10, function(err, passwordHash) {
			if (err) {
				throw err;
			} else {
				user.updatePassword(slr.email, passwordHash, function (err) {
					if (err) {
						throw err;
					} else {
						request.session.isPasswordReset = true;
						login.show(request, response);
					}
				});
			}
		});
	}
};


