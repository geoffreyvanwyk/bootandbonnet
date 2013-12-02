/*jshint node: true */

'use strict';

/**
 * @file
 * Component: sellers
 * Purpose: Contains routes that handle seller login.
 * Path: routes/sellers/login.js
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing passwords.

/* Import models. */
var Seller = require('../../models/sellers/sellers');
var PrivateSeller = require('../../models/sellers/private-sellers');
var Dealership = require('../../models/sellers/dealerships');

/* Import routes. */
var main = require('../../routes/main');

var login = module.exports = {
	/**
	 * @summary Responds to HTTP GET /login. Displays the login form.
	 *
	 * @description If the seller is logged-in, the function does nothing, because there is no reason for a logged-in
	 * seller to see the login form. In the user interface, there is no way for a logged-in seller to request the login
	 * form, but a logged-in seller might attempt to request it directly via the browser's location bar.
	 *
	 * If a log-in attempt fails, in other words, if the seller enters an email address that is not in the database, or
	 * if the password is wrong, the log-in form is displayed again, but this time with appropriate error messages. If
	 * the loginError property of the request.session object exists, it means that a log-in attempt has failed. The
	 * loginError property of the request.session object is set in the authenticateSeller function.
	 *
	 * After a seller has reset his password, the login form is shown to him, with a banner message across the top
	 * of the form, telling him that the password reset was successful, and that he may log-in again. If the
	 * isPasswordReset property of the request.session object is true, the banner is displayed. The isPasswordReset
	 * property of the request.session object is set in the resetPassword function of the password-reset module.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showForm: function (request, response) {
		if (!request.session.seller) { // If the seller property is null, a seller is not logged-in.
			response.render('sellers/login-form', {
				loginError: request.session.loginError || {
					emailAddress: '',
					emailError: '',
					password: '',
					passwordError: ''
				},
				isPasswordReset: request.session.isPasswordReset,
				isLoggedIn: false
			}, function (err, html) {
				if (err) {
					console.log('==================== BEGIN ERROR MESSAGE ====================');
					console.log(err);
					console.log('==================== END ERROR MESSAGE ======================');
					main.showErrorPage(request, response);
				} else {
					request.session.loginError = null;
					request.session.isPasswordReset = false;
					response.send(html);
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP POST /login. Authenticates the seller, logs-in the seller, then displays the home
	 * page.
	 *
	 * @description Authenticates the seller by:
	 *
	 * 1) using the findSeller() closure function to check whether there is any seller in the sellers database
	 * collection which has the email address entered into the login form; then, if there is such a seller,
	 *
	 * 2) using the comparePassword() closure function to hash the password entered into the login form, then compare
	 * the hash with the passwordHash of the seller.
	 *
	 * If the hashes are the same, the findPrivateSeller() closure function is used to retrieve the privateSeller object
	 * associated with the seller. If no such privateSeller exists, the associated dealership is retrieved using the
	 * findDealership() closure function.
	 *
	 * After this, the seller is logged-in by calling the login.setSession() method. The home page then is displayed by
	 * calling the main.showHomePage() method.
	 *
	 * If the email address does not exist in the database, or if the password is wrong, the login form is redisplayed
	 * with the errors.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	authenticate: function (request, response) {
		/* A seller object containing the email address and password entered into the login form. */
		var frmSeller = request.body.seller;

		var handleErrors = function (err) {
			console.log('==================== BEGIN ERROR MESSAGE ====================');
			console.log(err);
			console.log('==================== END ERROR MESSAGE ======================');
			request.session.loginError = {
				emailAddress: frmSeller.emailAddress,
				emailError: '',
				password: frmSeller.password,
				passwordError: ''
			};
			switch (err.message) {
				case 'The email address has not been registered.':
					request.session.loginError.emailError = err.message;
					login.showForm(request, response);
					break;
				case 'The password is wrong.':
					request.session.loginError.passwordError = err.message;
					login.showForm(request, response);
					break;
				default:
					main.showErrorPage(request, response);
					break;
			}
		};

		var findDealership = function (seller, callback) {
			Dealership.findOne({account: seller._id}, function (err, dealership) {
				if (err) {
					return callback(err);
				}
				if (!dealership) {
					return callback(new Error('No privateSeller or dealership is associated with this seller.'));
				}
				var privateSeller = null;
				return callback(null, seller, dealership, privateSeller);
			});
		};

		var findPrivateSeller = function (seller, callback) {
			PrivateSeller.findOne({account: seller._id}, function (err, privateSeller) {
				if (err) {
					return callback(err);
				}
				if (!privateSeller) {
					findDealership(seller, callback);
				} else {
					var dealership = null;
					return callback(null, seller, dealership, privateSeller);
				}
			});
		};

		var comparePassword = function (seller, callback) {
			bcrypt.compare(frmSeller.password, seller.passwordHash, function (err, isMatch) {
				if (err) {
					return callback(err);
				}
				if (isMatch) {
					findPrivateSeller(seller, callback);
				} else {
					return callback(new Error('The password is wrong.'));
				}
			});
		};

		var findSeller = function (callback) {
			Seller.findOne({emailAddress: frmSeller.emailAddress.toLowerCase()}, function (err, seller) {
				if (err) {
					return callback(err);
				}
				if (!seller) {
					return callback(new Error('The email address has not been registered.'));
				}
				comparePassword(seller, callback);
			});
		};

		findSeller(function (err, seller, dealership, privateSeller) {
			if (err) {
				handleErrors(err);
			} else {
				login.setSession(request, seller, dealership, privateSeller, function () {
					response.redirect(302, '/');
				});
			}
		});
	},
	/**
	 * @summary Creates a seller object and a privateSeller or dealership object as properties of the request.session
	 * object to log-in the seller.
	 *
	 * @param {object} request An HTTP request object received from the express HTTP method.
	 * @param {object} seller A seller object.
	 * @param {object} dealership A dealership object.
	 * @param {object} privateSeller A private seller object.
	 * @param {function} callback The function which is called when this function completes.
	 *
	 * @returns {undefined}
	 */
	setSession: function (request, seller, dealership, privateSeller, callback) {
		request.session.seller = seller;
		if (privateSeller) {
			request.session.privateSeller = privateSeller;
		} else {
			request.session.dealership = dealership;
		}
		return callback(null);
	}
};