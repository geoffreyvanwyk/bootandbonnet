/*jslint node: true */

"use strict";

/*
 * Component: sellers
 *
 * File: routes/sellers/login.js
 *
 * Purpose: Contains routes that handle seller login.
 */

/* Import external modules. */

var bcrypt = require('bcrypt');

/* Import models. */

var Seller = require('../../models/sellers/sellers').Seller;
var PrivateSeller = require('../../models/sellers/private-sellers').PrivateSeller;
var Dealership = require('../../models/sellers/dealerships').Dealership;

/* Import routes. */

var main = require('../../routes/main');

/**
 * Responds to HTTP GET /seller/login.
 *
 * Displays the login form.
 *
 * Before displaying the login form, the function checks whether the seller is logged-in. If the seller
 * is logged-in, the function does nothing, because there is no reason for a logged-in seller to see
 * the login form. In the user interface, there is no way for a logged-in seller to request the login
 * form, but a logged-in seller might attempt to request it directly via the browser's location bar.
 *
 * If a log-in attemt fails, in other words, if the seller enters an email address that is not in the
 * database, or if the password is wrong, the log-in form is displayed again, but, this time, with a banner
 * across the top of the form, telling the seller about the errors. If the isLoginFailed variable is true, the
 * banner is displayed. The login property of the request.session object is set in the authenticateSeller
 * function.
 *
 * After a seller has reset his password, the login form is shown to him, with a banner message across the top
 * of the form, telling him that the password reset was successful, and that he may log-in again. If the
 * isPasswordReset variable is true, the banner is displayed. The isPasswordReset property of the
 * request.session object is set in the resetPassword function of the password-reset module.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showLoginForm(request, response) {
	var isSellerLoggedIn = request.session.seller ? true : false;
	if (!isSellerLoggedIn) {
		var isLoginFailed = request.session.login ? true : false;
		if (isLoginFailed) {
			var emailAddress = request.session.login.emailAddress;
			var emailError = request.session.login.emailError;
			var passwordError = request.session.login.passwordError;
			request.session.login = null;
		}
		var isPasswordReset = request.session.isPasswordReset;
		if (isPasswordReset) {
			request.session.isPasswordReset = null;
		}
		response.render('sellers/login-form', {
			emailAddress: emailAddress || '',
			emailError: emailError || '',
			passwordError: passwordError || '',
			isPasswordReset: isPasswordReset || false,
			loggedIn: false
		});
	}
}

/**
 * Responds to HTTP POST /seller/login.
 *
 * Authenticates the seller, logs him/her in, then displays the home page. If the email address does not exist
 * in the database, or if the password is wrong, the login form is shown with the errors.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function authenticateSeller(request, response) {
	var formSeller = request.body.seller;
	Seller.findOne({emailAddress: formSeller.emailAddress}, function (err, seller) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else if (!seller) {
			request.session.login = {
				emailAddress: formSeller.emailAddress,
				emailError: 'The email address has not been registered.'
			};
		} else {
			bcrypt.compare(formSeller.password, seller.passwordHash, function (err, isMatch) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else if (isMatch) {
					PrivateSeller.findOne({account: seller._id}, function (err, privateSeller) {
						if (err) {
							console.log(err);
							main.showErrorPage(request, response);
						} else if (!privateSeller) {
							Dealership.findOne({account: seller._id}, function (err, dealership) {
								if (err) {
									console.log(err);
									main.showErrorPage(request, response);
								} else {
									var privateSeller = null;
									setSession(request, response, seller, dealership, privateSeller,
												main.showHomePage);
								}
							});
						} else {
							var dealership = null;
							setSession(request, response, seller, dealership, privateSeller,
										main.showHomePage);
						}
					});
				} else {
					request.session.login = {
						passwordError: 'The password is wrong.'
					};
					showLoginForm(request, response);
				}
			});
		}
	});
}

/**
 * Creates a seller object as a property of the request.session object.
 *
 * @param		{object}    	request		An HTTP request object received from the express HTTP method.
 * @param		{object}    	response	An HTTP response object received from the express HTTP method.
 * @param		{object}		seller		A seller object.
 * @param		{object}		dealership	A dealership object.
 * @param		{object}		dealership	A private seller object.
 * @param		{function}		callback	The function which is called when this function completes.
 *
 * @returns	{undefined}		Returns its callback function with no arguments.
 */
function setSession(request, response, seller, dealership, privateSeller, callback) {
	request.session.seller = {
		_id: seller._id,
		emailAddress: seller.emailAddress,
		passwordHash: seller.passwordHash,
		emailAddressVerified: seller.emailAddressVerified,
		loggedIn: true
	};
	if (privateSeller) {
		request.session.privateSeller = {
			_id: privateSeller._id,
			name: privateSeller.name,
			telephone: privateSeller.telephone,
			cellphone: privateSeller.cellphone,
			address: privateSeller.address,
			account: privateSeller.account
		};
	} else {
		request.session.dealership = {
			_id: dealership._id,
			name: dealership.name,
			address: dealership.address,
			contactPerson: dealership.contactPerson,
			telephone: dealership.telephone,
			cellphone: dealership.cellphone,
			account: dealership.account
		};
	}
	if (typeof(callback) === "function") {
		if (callback.toString().indexOf("showHomePage") !== -1) {
			return callback(request, response);
		}
		return callback(null);
	}
}

module.exports = {
	showLoginForm: showLoginForm,
	authenticateSeller: authenticateSeller,
	setSession: setSession
};