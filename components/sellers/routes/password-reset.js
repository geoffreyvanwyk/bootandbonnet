"use strict";

var bcrypt = require('bcrypt');
var email = require('../../../email').email;
var login = require('./login').login;
var userPrototype = require('../models/users').user;

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
		var user = Object.create(userPrototype);
		user.username = request.body.seller.email;
		user.read(function(err, user) {
			if (err && err.message === 'The email address has not been registered.') {
				request.session.passwordReset = {
					emailError: err.message,
					email: user.username 
				};
				resetPassword.showForgot(request, response);
			} else if (err) {
				throw err;
			} else {
				bcrypt.hash(user.username, 10, function(err, hash) {
					if (err) {
						throw err;
					} else {
						var link = 'http://localhost:3000/seller/login/password/reset?email='.concat(encodeURIComponent(user.username)).concat('&hash=').concat(hash);
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
							to: user.username,
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
		bcrypt.hash(slr.password, 10, function(err, passwordHash) {
			if (err) {
				throw err;
			} else {
				var user = Object.create(userPrototype);
				user.username = slr.email;
				user.read(function (err, user) {
					if (err) {
						throw err;
					} else {
						user.passwordHash = passwordHash;
						user.update(function (err) {
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
		});
	}
};


