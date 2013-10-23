/*jslint node: true */

'use strict';

/*
 * Component: sellers
 *
 * File: routes/sellers/registration.js
 *
 * Purpose: Contains routes that handle registration of new sellers and modification of existing sellers.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import libraries. */
var sanitize = require('../../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/* Import models. */
var Seller = require('../../models/sellers/sellers').Seller;
var PrivateSeller = require('../../models/sellers/private-sellers').PrivateSeller;
var Dealership = require('../../models/sellers/dealerships').Dealership;
var Province = require('../../models/provinces').Province;

/* Import routes. */
var email = require('./email-address-verification');
var main = require('../../routes/main');
var login = require('./login');

/**
 * Responds to HTTP GET /seller/:id.
 *
 * If a seller is not logged-in, the login-form is displayed. and the logged-in seller's id corresponds with :id, then the next route function
 * is called; else, if 
 * 


/**
 * Responds to HTTP GET /seller/add and HTTP GET /seller/:sellerId/edit.
 *
 * Displays seller registration-form, to either add or edit a seller profile.
 *
 * If the url is /seller/add, but a seller is logged-in, a new profile cannot be added, so the function will 
 * do nothing. If the url is /seller/edit, but a seller is not logged-in, a profile cannot be edited, so the function will do nothing.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showRegistrationForm(request, response) {
	var action = request.path.split('/').slice(-1)[0];
	var isSellerLoggedIn = request.session.seller ? true : false;
	Province.find(function (err, provinces) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else if ((action === 'add') && (!isSellerLoggedIn)) {
			var locals = {
				validation: request.session.registrationFormValidation,
				provinces: provinces,
				action: '/seller/add',
				heading: 'New Seller',
				buttonCaption: 'Register',
				/* request.session.emailError is set by addProfile if the email address is already
				* registered.*/
				emailError: request.session.emailError || '',
				sellerType: '',
				emailAddress: '',
				password: '',
				firstname: '',
				surname: '',
				telephone: '',
				cellphone: '',
				dealershipName: '',
				streetAddress1: '',
				streetAddress2: '',
				province: '',
				town: '',
				townId: '',
				loggedIn: isSellerLoggedIn
			};
		} else if ((action === 'edit') && (isSellerLoggedIn)) {
			if (request.session.privateSeller) {
				var seller = request.session.privateSeller;
				var firstname = seller.name.firstname;
				var surname = seller.name.surname;
				var dealershipName = '';
				var streetAddress1 = '';
				var streetAddress2 = '';
			} else {
				var seller = request.session.dealership;
				var firstname = seller.contactPerson.firstname;
				var surname = seller.contactPerson.surname;
				var dealershipName = seller.name;
				var streetAddress1 = seller.address.street;
				var streetAddress2 = seller.address.suburb;
			}
			var locals = {
				validation: request.session.registrationFormValidation,
				provinces: provinces,
				action: '/seller/edit',
				heading: 'Edit Seller',
				buttonCaption: 'Save Changes',
				/* request.session.emailError is set by addProfile if the email address is already
				* registered.*/
				emailError: request.session.emailError || '',
				sellerType: request.session.privateSeller ? 'privateSeller' : 'dealership',
				emailAddress: request.session.seller.emailAddress,
				password: '',
				firstname: firstname,
				surname: surname,
				telephone: seller.telephone,
				cellphone: seller.cellphone,
				dealershipName: dealershipName,
				streetAddress1: streetAddress1,
				streetAddress2: streetAddress2,
				province: seller.address.province,
				town: seller.address.town,
				loggedIn: isSellerLoggedIn
			};
		}
		response.render('sellers/registration-form', locals, function (err, html) {
			request.session.emailError = null;
			request.session.registrationFormValidation = null;
			response.send(html);
		});
	});
}

/**
 * Responds to HTTP POST /seller/add and HTTP POST /seller/edit.
 *
 * Validates the inputs on the seller registration form. If any of the inputs are invalid, it redisplays the
 * registration form; otherwise, it calls the addProfile or editProfile functions.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function validateInputs(request, response) {
	var action = request.path.split('/').slice(-1)[0];
	var isSellerLoggedIn = request.session.seller ? true : false;
	var formSeller = request.body.seller;
	var regExpStr = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$";
	var regExp = new RegExp(regExpStr, 'gim');
	request.session.registrationFormValidation = {
		isEmailValid: regExp.test(formSeller.emailAddress),
		isPasswordValid: (function () {
			if (action === 'add' && !isSellerLoggedIn) {
				return (formSeller.password.length >= 8);
			} else if (action === 'edit' && isSellerLoggedIn) {
				return (formSeller.password.length >= 8 || formSeller.password.length === 0);
			}
		}()),
		isPasswordConfirmed: formSeller.password === formSeller.confirmPassword,
		isTelephoneProvided: (formSeller.telephone !== '' || formSeller.cellphone !== ''),
		isLocationProvided: (formSeller.province !== 'Please select ...' &&
							formSeller.town !== 'Please select ...'),
		isSellerTypeProvided: formSeller.type ? true : false,
		isDealershipNameProvided: (function () {
			if (formSeller.type === 'dealership') {
				return formSeller.dealershipName !== '';
			} else if (formSeller.type === 'private seller') {
				return true;
			}
		}()),
		isDealershipAddressProvided: (function () {
			if (formSeller.type === 'dealership') {
				return formSeller.streetAddress1 !== '';
			} else if (formSeller.type === 'private seller') {
				return true;
			}
		}())
	};
	var fv = request.session.registrationFormValidation;
	for (var c in fv){
		if (!fv[c]) {
			showRegistrationForm(request, response);
		}
	}
	if (action === 'add' && !isSellerLoggedIn) {
		addProfile(request, response);
	} else if (action === 'edit' && isSellerLoggedIn) {
		editProfile(request, response);
	}
}

/**
 * Inserts a new seller into the sellers database collection, a new dealership into the dealerships database
 * collection (if the seller type is 'dealership'), creates a seller session object, logs-in the new seller,
 * and displays the seller profile page.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function addProfile(request, response) {
	var formSeller = request.body.seller;
	bcrypt.hash(formSeller.password, 10, function (err, passwordHash) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			var seller = new Seller({
				emailAddress: formSeller.emailAddress,
				passwordHash: passwordHash
			});
			seller.save(function (err, seller) {
				if (err && (err.message.substring('duplicate key error index') !== -1)) {
					request.session.emailError = 'That email address has been registered already.';
					showRegistrationForm(request, response);
				} else if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else if (formSeller.type === 'private seller') {
					var privateSeller = new PrivateSeller({
						name: {
							firstname: formSeller.firstname,
							surname: formSeller.surname
						},
						telephone: formSeller.telephone,
						cellphone: formSeller.cellphone,
						address: {
							town: formSeller.town,
							province: formSeller.province,
						},
						account: seller._id
					});
					privateSeller.save(function (err, privateSeller) {
						if (err) {
							console.log(err);
							main.showErrorPage(request, response);
						} else {
							var dealership = null;
							login.setSession(request, response, seller, dealership, privateSeller,
								function () {
									showProfile(request, response, email.sendEmail);
								}
							);
						}
					});
				} else {
					var dealership = new Dealership({
						name: formSeller.dealershipName,
						contactPerson: {
							firstname: formSeller.firstname,
							surname: formSeller.surname
						},
						address: {
							street: formSeller.streetAddress1,
							suburb: formSeller.streetAddress2,
							town: formSeller.town,
							province: formSeller.province,
						},
						telephone: formSeller.telephone,
						cellphone: formSeller.cellphone,
						account: seller._id
					});
					dealership.save(function (err, dealership) {
						if (err) {
							console.log(err);
							main.showErrorPage(request, response);
						} else {
							var privateSeller = null;
							login.setSession(request, response, seller, dealership, privateSeller,
								function () {
									showProfile(request, response, email.sendEmail);
								}
							);
						}
					});
				}
			});
		}
	});
}

/**
 * Responds to HTTP GET /seller/view/:sid.
 *
 * Displays the seller's profile.
 *
 * @param		{object}		request		An HTTP request object received from the express.get() method.
 * @param		{object}		response	An HTTP response object received from the express.get() method.
 * @param 		{function} 		callback 	A callback function.
 *
 * @returns	{undefined}		Returns the request and response objects to a callback function.
 */
function showProfile(request, response, callback) {
	var isPrivateSeller = request.session.privateSeller ? true : false;
	if (isPrivateSeller) {
		var seller = request.session.privateSeller;
		var fullname = seller.name.firstname.concat(' ').concat(seller.name.surname);
		var dealershipName = '';
		var streetAddress1 = '';
		var streetAddress2 = '';
	} else {
		var seller = request.session.dealership;
		var fullname = seller.contactPerson.firstname.concat(' ').concat(seller.contactPerson.surname);
		var dealershipName = seller.name;
		var streetAddress1 = seller.address.street;
		var streetAddress2 = seller.address.suburb;
	}
	response.render('sellers/profile-page', {
		method: 'delete',
		sellerType: request.session.dealership ? 'dealership' : 'private seller',
		email: request.session.seller.emailAddress,
		fullname: fullname,
		telephone: seller.telephone,
		cellphone: seller.cellphone,
		dealershipName: dealershipName,
		streetAddress1: streetAddress1,
		streetAddress2: streetAddress2,
		province: seller.address.province,
		town: seller.address.town,
		loggedIn: true
	});
	return callback(request, response);
}

/**
 * Edits the seller profile, then displays it.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function editProfile(request, response) {
	var formSeller = request.body.seller;
	var sessionSeller = request.session.seller;
	var isEmailChanged = formSeller.emailAddress.toLowerCase() !== sessionSeller.emailAddress.toLowerCase();
	var isPasswordChanged = formSeller.password !== "";

	function updateSeller(callback) {
		if (isEmailChanged && isPasswordChanged) {
			bcrypt.hash(formSeller.password, 10, function (err, hash) {
				if (err) {
					return callback(err)
				} else {
					Seller.findByIdAndUpdate(sessionSeller._id, {
						$set: {
							emailAddress: formSeller.emailAddress,
							passwordHash: hash,
							emailAddressVerified: false
						}
					}, function (err, seller) {
						if (err) {
							return callback(err);
						}
						sessionSeller.emailAddres = seller.emailAddress;
						sessionSeller.passworsHash = seller.passwordHash;
						return callback(null, seller);
					});
				}
			});
		} else if (isEmailChanged) {
			Seller.findByIdAndUpdate(sessionSeller._id, {
				$set: {
					emailAddress: formSeller.emailAddress,
					emailAddressVerified: false
				}
			}, function (err, seller) {
				if (err) {
					return callback(err);
				}
				sessionSeller.emailAddress = seller.emailAddress;
				return callback(null, seller);
			});
		} else if (isPasswordChanged) {
			bcrypt.hash(formSeller.password, 10, function (err, hash) {
				if (err) {
					return callback(err)
				} else {
					Seller.findByIdAndUpdate(sessionSeller._id, {
						$set: {
							passwordHash: hash,
						}
					}, function (err, seller) {
						if (err) {
							return callback(err);
						}
						sessionSeller.passworsHash = seller.passwordHash;
						return callback(null, seller);
					});
				}
			});
		} else {
			return callback(null, sessionSeller);
		}
	}

	var sessionPrivateSeller = request.session.privateSeller;
	var sessionDealership = request.session.dealership;

	updateSeller(function (err, seller) {
		if (err) {
			console.log(err);
			return main.showErrorPage(request, response);
		} else if (formSeller.type === 'privateSeller' && sessionPrivateSeller) {
			PrivateSeller.findByIdAndUpdate(sessionPrivateSeller._id, {
				$set: {
					name: {
						firstname: formSeller.firstname,
						surname: formSeller.surname
					},
					telephone: formSeller.telephone,
					cellphone: formSeller.cellphone,
					address: {
						town: formSeller.town,
						province: formSeller.province
					}
				}
			}, function (err, privateSeller) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					request.session.privateSeller = privateSeller;
					showProfile(request, response, function (request, response) {
						if (isEmailChanged) {
							return email.sendEmail(request, response);
						}
						return;
					});
				}
			});
		} else if ((formSeller.type === 'dealership') && sessionDealership) {
			Dealership.findByIdAndUpdate(sessionDealership._id, {
				$set: {
					name: formSeller.dealershipName,
					contactPerson: {
						firstname: formSeller.firstname,
						surname: formSeller.surname
					},
					telephone: formSeller.telephone,
					cellphone: formSeller.cellphone,
					address: {
						street: formSeller.streetAddress1,
						suburb: formSeller.streetAddress2,
						town: formSeller.town,
						province: formSeller.province
					}
				}
			}, function (err, dealership) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					request.session.dealership = dealership;
					showProfile(request, response, function (request, response) {
						if (isEmailChanged) {
							return email.sendEmail(request, response);
						}
						return;
					});
				}
			});
		} else if ((formSeller.type === 'dealership') && sessionPrivateSeller) {
			request.session.dealership = {
				_id: sessionPrivateSeller._id,
				name: formSeller.dealershipName,
				contactPerson: {
					firstname: formSeller.firstname,
					surname: formSeller.surname
				},
				telephone: formSeller.telephone,
				cellphone: formSeller.cellphone,
				address: {
					street: formSeller.streetAddress1,
					suburb: formSeller.streetAddress2,
					town: formSeller.town,
					province: formSeller.province
				},
				sellerId: sessionPrivateSeller.sellerId
			};
			request.session.privateSeller = null;
			var dealership = new Dealership(request.session.dealership);
			dealership.save(function (err, dealership) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					PrivateSeller.findByIdAndRemove(dealership._id, function (err) {
						if (err) {
							console.log(err);
							return main.showErrorPage(request, response);
						} else {
							showProfile(request, response, function (request, response) {
								if (isEmailChanged) {
									return email.sendEmail(request, response);
								}
								return;
							});
						}
					});
				}
			});
		} else if ((formSeller.type === 'privateSeller') && sessionDealership) {
			request.session.privateSeller = {
				_id: sessionDealership._id,
				name: {
					firstname: formSeller.firstname,
					surname: formSeller.surname
				},
				telephone: formSeller.telephone,
				cellphone: formSeller.cellphone,
				address: {
					town: formSeller.town,
					province: formSeller.province
				},
				sellerId: sessionDealership.sellerId
			};
			request.session.dealership = null;
			var privateSeller = new PrivateSeller(request.session.privateSeller);
			privateSeller.save(function (err, privateSeller) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					Dealership.findByIdAndRemove(privateSeller._id, function (err) {
						if (err) {
							console.log(err);
							return main.showErrorPage(request, response);
						} else {
							showProfile(request, response, function (request, response) {
								if (isEmailChanged) {
									return email.sendEmail(request, response);
								}
								return;
							});
						}
					});
				}
			});
		}
	});
}

/**
 * Responds to HTTP GET /seller/remove.
 *
 * Deletes the seller from the database, then displays the home page.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function removeProfile(request, response) {
	var sessionSeller = request.session.seller;
	var sessionPrivateSeller = request.session.privateSeller;
	var sessionsessionDealership = request.session.dealership;

	if (sessionPrivateSeller) {
		PrivateSeller.findByIdAndRemove(sessionPrivateSeller._id, function (err) {
			if (err) {
				console.log(err);
				return main.showErrorPage(request, response);
			} else {
				request.session.privateSeller = null;
				Seller.findByIdAndRemove(sessionSeller._id, function (err) {
					if (err) {
						console.log(err);
						return main.showErrorPage(request, response);
					} else {
						request.session.seller = null;
						return main.showHomePage(request, response);
					}
				});
			}
		});
	} else if (sessionDealership) {
		Dealership.findByIdAndRemove(sessionDealership._id, function (err) {
			if (err) {
				console.log(err);
				return main.showErrorPage(request, response);
			} else {
				request.session.dealership = null;
				Seller.findByIdAndRemove(sessionSeller._id, function (err) {
					if (err) {
						console.log(err);
						return main.showErrorPage(request, response);
					} else {
						request.session.seller = null;
						return main.showHomePage(request, response);
					}
				});
			}
		});
	}
}

module.exports = {
	showRegistrationForm: showRegistrationForm,
	validateInputs: validateInputs,
	showProfile: showProfile,
	removeProfile: removeProfile
};
