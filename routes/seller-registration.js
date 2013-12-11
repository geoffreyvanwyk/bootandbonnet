/*jshint node: true*/

'use strict';

/**
 * @file routes/seller-registration.js
 * Component: sellers
 * Purpose: Contains routes that handle registration of new sellers and modification of existing sellers.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import libraries. */
var sanitize = require('../../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/* Import models. */
var Province = require('../../models/provinces');
var Seller = require('../../models/sellers');
var User = require('../../models/users');
var Vehicle = require('../../models/vehicles');

/* Import functions. */
var email = require('./email-address-verification');
var login = require('./login');
var main = require('../../routes/main');

var handleErrors = function (err, seller, form) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');

	var isEmailDuplicateError = (
		err.message.indexOf('duplicate key error index') !== -1 &&
		err.message.indexOf('emailAddress') !== -1
	) ? true : false;

	var isEmailInvalidError = (
		err.name === 'ValidationError' &&
		err.errors.emailAddress &&
		err.errors.emailAddress.message === 'invalid email address'
	) ? true : false;

	var isEmailMissingError = (
		err.name == 'ValidationError' &&
		err.errors.emailAddress &&
		err.errors.emailAddress.type === 'required'
	) ? true : false;

	/* Accounts for both a missing password, and an invalid password. See models/users.js. */
	var isPasswordError = (
		err.name === 'ValidationError' &&
		err.errors.passwordHash &&
		err.errors.passwordHash.type === 'required'
	) ? true : false;

	var isFirstnameInvalidError = (
		err.name === 'ValidationError' &&
		err.errors['contactPerson.firstname'] &&
		err.errors['contactPerson.firstname'].message === 'invalid firstname'
	) ? true : false;

	var isFirstnameMissingError = (
		err.name === 'ValidationError' &&
		err.errors['contactPerson.firstname'] &&
		err.errors['contactPerson.firstname'].type === 'required'
	) ? true : false;

	var isSurnameInvalidError = (
		err.name === 'ValidationError' &&
		err.errors['contactPerson.surname'] &&
		err.errors['contactPerson.surname'].message === 'invalid surname'
	) ? true : false;

	var isSurnameMissingError = (
		err.name === 'ValidationError' &&
		err.errors['contactPerson.surname'] &&
		err.errors['contactPerson.surname'].type === 'required'
	) ? true : false;

	var isContactNumbersInvalidError = (
		err.name === 'ValidationError' &&
		err.errors.contactNumbers &&
		err.errors.contactNumbers.message === 'invalid contact number'
	) ? true : false;

	var isContactNumbersMissingError = (
		err.name === 'ValidationError' &&
		err.errors.contactNumbers &&
		err.errors.contactNumbers.type === 'required'
	) ? true : false;

	var isProvinceMissingError = (
		err.errors &&
		err.errors['address.province']
	) ? true : false;

	var isTownMissingError = (
		err.errors &&
		err.errors['address.town']
	) ? true : false;

	var isUserError = (
		isEmailDuplicateError ||
		isEmailInvalidError ||
		isEmailMissingError ||
		isPasswordError
	) ? true : false;

	var isNameError = (
		isFirstnameInvalidError ||
		isFirstnameMissingError ||
		isSurnameInvalidError ||
		isSurnameMissingError
	) ? true : false;

	var isContactNumbersError = (
		isContactNumbersInvalidError ||
		isContactNumbersMissingError
	) ? true : false;

	var isLocationError = (
		isProvinceMissingError ||
		isTownMissingError
	) ? true : false;

	var isSellerError = (
		isNameError ||
		isContactNumbersError ||
		isLocationError
	) ? true : false;

	var isPersonError = (
		isUserError ||
		isSellerError
	) ? true : false;

	var isAddProfileError = ( // Error encountered by addProfile function.
		isPersonError &&
		user
	) ? true : false;

	var validationErrors = {
		emailError: '',
		emailAlertType: '',
		passwordError: '',
		passwordAlertType: ''
		firstnameError: '',
		firstnameAlertType: '',
		surnameError: '',
		surnameAlertType: '',
		contactNumbersError: '',
		contactNumbersAlertDisplay: 'none',
		provinceError: '',
		provinceAlertType: '',
		townError: '',
		townAlertType: ''
	};

	var remove = function (user) {
		User.findByIdAndRemove(user._id, function (err) {
			if (err) {
				handleErrors(err, user);
			}
		});
	};

	if (isEmailDuplicateError) {
		validationErrors.emailError = 'The email address has been registered already.';
		validationErrors.emailAlertType = 'error';
	} else if (isEmailInvalidError) {
		validationErrors.emailError = 'The email address is invalid.';
		validationErrors.emailAlertType = 'error';
	} else if (isEmailMissingError) {
		validationErrors.emailError = 'An email address is required.';
		validationErrors.emailAlertType = 'error';
	}

	if (isPasswordError) {
		validationErrors.passwordError = 'A password is required.';
		validationErrors.passwordAlertType = 'error';
	}

	if (isFirstnameInvalidError) {
		validationErrors.firstnameError = "Use only letters, spaces, hyphens (-) and apostrophes (').";
		validationErrors.firstnameAlertType = 'error';
	} else if (isFirstnameMissingError) {
		validationErrors.firstnameError = "A firstname is required.";
		validationErrors.firstnameAlertType = 'error';
	}

	if (isSurnameInvalidError) {
		validationErrors.surnameError = "Use only letters, spaces, hyphesn (-) and apostrophes (').";
		validationErrors.surnameAlertType = 'error';
	} else if (isSurnameMissingError) {
		validationErrors.surnameError = 'A surname is required.';
		validationErrors.surnameAlertType = 'error';
	}

	if (isContactNumbersInvalidError) {
		validationErrors.contactNumbersError = 'Use only digits in a contact number, e.g. 0123431915.';
		validationErrors.contactNumbersAlertDisplay = '';
	} else if (isContactNumbersMissingError) {
		validationErrors.contactNumbersError = 'At least one contact number is required.';
		validationErrors.contactNumbersAlertDisplay = '';
	}

	if (isProvinceMissingError) {
		validationErrors.provinceError = 'A province is required.';
		validationErrors.provinceAlertType = 'error';
	}

	if (isTownMissingError) {
		validationErrors.townError = 'A town is required.';
		validationErrors.townAlertType = 'error';
	}

	if (isPersonError) {
		request.session.validationErrors = validationErrors;
		form(request, response);
		if (isAddProfileError) {
			remove(user);
		}
	} else {
		main.showErrorPage(request, response);
	}
};

var sellers = module.exports = {
	/**
	 * @summary Responds to HTTP GET /sellers/add. Displays views/seller-registration-form, unless a seller is
	 * logged-in, in which case it does nothing.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showRegistrationForm: function (request, response) {
		var frmSeller = request.body.seller;
		var isLoggedIn = request.session.seller ? true : false;
		if (!isLoggedIn) {
			Province.find(function (err, provinces) {
				if (err) {
					handleErrors(err);
				} else {
					response.render('seller-registration-form', {
						validationErrors: request.session.validationErrors,
						provinces: provinces,
						action: '/sellers/add',
						heading: 'New Seller',
						buttonCaption: 'Register',
						sellerType: '',
						emailAddress: frmSeller && frmSeller.emailAddress || '',
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
						isLoggedIn: isLoggedIn
					}, function (err, html) {
						request.session.validationErrors = null;
						if (err) {
							handleErrors(err);
						} else {
							response.send(html);
						}
					});
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/edit. Displays views/sellers/registration-form, unless a seller
	 * is not logged-in, in which case it does nothing.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showEditForm: function (request, response) {
		var ssnSeller = request.session.seller;
		var dtlSeller = request.session.privateSeller || request.session.dealership;
		var isLoggedIn = request.session.seller ? true : false;
		if (isLoggedIn) {
			Province.find(function (err, provinces) {
				if (err) {
					console.log('==================== BEGIN ERROR MESSAGE ====================');
					console.log(err);
					console.log('==================== END ERROR MESSAGE ======================');
					main.showErrorPage(request, response);
				} else {
					response.render('seller-registration-form', {
						validationErrors: request.session.validationErrors,
						provinces: provinces,
						action: '/seller/:'.concat(ssnSeller._id).concat('/edit'),
						heading: 'Edit Seller',
						buttonCaption: 'Edit',
						sellerType: '',
						emailAddress: ssnSeller.emailAddress,
						password: '',
						firstname: dtlSeller.name,
						surname: '',
						contactNumbers: dtlSeller.contactNumbers,
						dealershipName: '',
						streetAddress1: '',
						streetAddress2: '',
						province: '',
						town: '',
						townId: '',
						isLoggedIn: isLoggedIn
					}, function (err, html) {
						request.session.validationErrors = null;
						if (err) {
							console.log('==================== BEGIN ERROR MESSAGE ====================');
							console.log(err);
							console.log('==================== END ERROR MESSAGE ======================');
						} else {
							response.send(html);
						}
					});
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP POST /sellers/add. Creates a new seller profile; then displays the profile page.
	 *
	 * @description Inserts a new seller into the sellers database collection, a new dealership into the dealerships
	 * database collection or a new private seller into the privatesellers database collection, creates a
	 * seller session object, logs-in the new seller, then displays views/sellers/profile-page.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	addProfile: function (request, response) {
		var frmUser = request.body.user;
		var frmSeller = request.body.seller;

		var createSeller = function (user, callback) {
			var seller = new Seller({
				dealershipName: frmSeller.dealershipName,
				contactPerson: {
					firstname: sanitize(frmSeller.firstname),
					surname: sanitize(frmSeller.surname)
				},
				contactNumbers: [
					sanitize(frmSeller.telephone),
					sanitize(frmSeller.cellphone)
				],
				address: {
					street: sanitize(frmSeller.street),
					suburb: sanitize(frmSeller.suburb),
					town: sanitize(frmSeller.town),
					province: sanitize(frmSeller.province)
				},
				user: user._id
			});
			seller.save(function (err, seller) {
				if (err) {
					return callback(err, user);
				}
				return callback(null, user, seller);
			});
		};

		var createUser = function (callback) {
			var user = new User({
				emailAddress: sanitize(frmUser.emailAddress.toLowerCase().trim()),
				passwordHash: frmUser.password
			});
			user.save(function (err, user) {
				if (err) {
					return callback(err);
				}
				createSeller(user, callback);
			});
		};

		createSeller(function (err, user, seller) {
			if (err) {
				handleErrors(err, user, sellers.showRegistrationForm);
			} else {
				login.setSession(request, user, seller, function () {
					response.redirect(302, '/seller/'.concat(seller._id.toString()).concat('/view'));
					email.sendEmail(request, response);
				});
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/view. Displays the views/sellers/profile-page.ejs for the
	 * logged-in seller.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 * @param {function} callback A callback function.
	 *
	 * @returns {undefined} Returns the request and response objects to a callback function.
	 */
	showProfile: function (request, response, callback) {
		/* Object containting the decallbacks of the logged-in seller. */
		var dtlSeller = request.session.privateSeller || request.sesssion.dealership;

		var isLoggedIn = request.session.seller ? true : false;
		var isOwnProfile = request.session.seller._id === request.params.sellerId;
		var isAuthorized = isLoggedIn && isOwnProfile;

		var isPrivateSeller = request.session.privateSeller ? true : false;

		var fullname;

		if (isPrivateSeller) {
			fullname = dtlSeller.name.firstname.concat(' ').concat(dtlSeller.name.surname);
		} else {
			fullname = dtlSeller.contactPerson.firstname.concat(' ').concat(dtlSeller.contactPerson.surname);
		}

		if (isAuthorized) {
			response.render('seller-profile-page', {
				sellerId: request.session.seller._id,
				sellerType: isPrivateSeller ? 'private seller': 'dealership',
				email: request.session.seller.emailAddress,
				dealershipName: dtlSeller.name,
				fullname: fullname,
				contactNumbers: dtlSeller.contactNumbers,
				address: dtlSeller.address,
				isLoggedIn: true
			});
			return callback(request, response);
		}
	},
	/**
	 * @summary Responds to HTTP POST /seller/:sellerid/edit. Edits the logged-in seller's' profile, then displays it.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	editProfile: function (request, response) {
		var frmUser = request.body.user;
		var frmSeller = request.body.seller;
		var ssnUser = request.session.user;
		var ssnSeller = request.session.seller;

		var isEmailChanged = frmUser.emailAddress.toLowerCase().trim() !== ssnUser.emailAddress;
		var isPasswordChanged = frmUser.password !== "";

		var updateUser = function (callback) {
			if (isEmailChanged && isPasswordChanged) {
				User.findByIdAndUpdate(ssnUser._id, {
					$set: {
						emailAddress: frmUser.emailAddress.toLowerCase().trim,
						passwordHash: frmUser.password,
						emailAddressVerified: false
					}
				}, function (err, user) {
					if (err) {
						return callback(err);
					}
					ssnUser.emailAddress = user.emailAddress;
					ssnUser.passwordHash = user.passwordHash;
					return callback(null);
				});
			} else if (isEmailChanged) {
				User.findByIdAndUpdate(ssnUser._id, {
					$set: {
						emailAddress: frmUser.emailAddress.toLowerCase().trim(),
						emailAddressVerified: false
					}
				}, function (err, user) {
					if (err) {
						return callback(err);
					}
					ssnUser.emailAddress = user.emailAddress;
					return callback(null);
				});
			} else if (isPasswordChanged) {
				User.findByIdAndUpdate(ssnUser._id, {
					$set: {
						passwordHash: frmUser.password,
					}
				}, function (err, user) {
					if (err) {
						return callback(err);
					}
					ssnUser.passwordHash = user.passwordHash;
					return callback(null);
				});
			} else {
				return callback(null);
			}
		};

		var updateSeller = function (callback) {
			Seller.findByIdAndUpdate(ssnSeller._id, {
				$set: {
					name: {
						firstname: sanitize(frmSeller.firstname),
						surname: sanitize(frmSeller.surname)
					},
					contactNumbers: [
						sanitize(frmSeller.telephone),
						sanitize(frmSeller.cellphone)
					],
					address: {
						town: sanitize(frmSeller.town),
						province: sanitize(frmSeller.province)
					}
				}
			}, function (err, Seller) {
				if (err) {
					return callback(err);
				}
				request.session.seller = seller;
				updateUser(callback);
			});
		};

		updateSeller(function (err) {
			if (err) {
				handleErrors(err, null, sellers.showEditForm);
			} else {
				sellers.showProfile(request, response);
				if (isEmailChanged) {
					email.sendEmail(request, response);
				}
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/remove. Removes the logged-in seller's profile as well as the
	 * profiles of all his/her vehicles; then displays the home page.
	 *
	 * @description A user is only allowed to remove his own profile, and he must be logged-in to do so.
	 *
	 * Using the removeVehicles() closure function, the logged-in seller's vehicles are removed from the vehicles
	 * database collection.
	 *
	 * Then, depending on whether the logged-in seller is a private seller or a dealership, using either the removePrivateSeller() closure function or the removeDealership() closure function, the logged-in
	 * seller is removed from the privatesellers or dealerships database collections.
	 *
	 * This is followed by deleting the seller from the sellers database collection.
	 *
	 * Lastly, the home page is displayed.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	removeProfile: function (request, response) {
		var isLoggedIn = request.session.seller ? true : false;
		var loggedInId = isLoggedIn && request.session.seller._id;
		var profileId = request.params.sellerId;
		var isOwnProfile = loggedInId === profileId ? true : false;

		var isAuthorized = (
			isLoggedIn &&
			isOwnProfile
		) ? true : false;

		isPrivateSeller = request.session.privateSeller ? true : false;
		isDealership = request.session.dealership ? true : false;

		var removeSeller = function (callback) {
			Seller.findByIdAndRemove(request.session.seller._id, function (err) {
				if (err) {
					return callback(err);
				}
				request.session.seller = null;
				return callback(null);
			});
		};

		var removePrivateSeller = function (callback) {
			PrivateSeller.findByIdAndRemove(request.session.privateSeller._id, function (err) {
				if (err) {
					return callback(err);
				}
				request.session.privateSeller = null;
				removeSeller(callback);
			});
		};

		var removeDealership = function (callback) {
			Dealership.findByIdAndRemove(request.session.dealership._id, function (err) {
				if (err) {
					return callback(err);
				}
				request.session.dealership = null;
				removeSeller(callback);
			});
		};

		var removeVehicles = function (callback) {
			Vehicle.remove({seller: request.session.seller._id}, function (err) {
				if (err) {
					return callback(err);
				}
				if (isPrivateSeller) {
					removePrivateSeller(callback);
				} else if (isDealership) {
					removeDealership(callback);
				}
			});
		};

		if (isAuthorized) {
			removeVehicles(function (err) {
				if (err) {
					console.log('==================== BEGIN ERROR MESSAGE ====================');
					console.log(err);
					console.log('==================== END ERROR MESSAGE ======================');
					main.showErrorPage(request, response);
				} else {
					main.showHomePage(request, response);
				}
			});
		}
	}
};