/*jshint node: true */

'use strict';

/**
 * @file routes/sellers/registration.js
 *
 * Component: sellers
 *
 * Purpose: Contains routes that handle registration of new sellers and modification of existing sellers.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import libraries. */
var sanitize = require('../../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/* Import models. */
var Dealership = require('../../models/sellers/dealerships');
var PrivateSeller = require('../../models/sellers/private-sellers');
var Province = require('../../models/provinces').Province;
var Seller = require('../../models/sellers/sellers');
var Vehicle = require('../../models/vehicles/vehicles').Vehicle;

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

	/* Accounts for both a missing password, and an invalid password. See models/sellers/sellers.js. */
	var isPasswordError = (
		err.name === 'ValidationError' &&
		err.errors.passwordHash &&
		err.errors.passwordHash.type === 'required'
	) ? true : false;

	var isSellerTypeMissingError = (
		err.message === 'Seller type must be specified.'
	) ? true : false;

	var isFirstnameInvalidError = (
		err.name === 'ValidationError' &&
		((
			err.errors['name.firstname'] &&
			err.errors['name.firstname'].message === 'invalid firstname'
		) || (
			err.errors['contactPerson.firstname'] &&
			err.errors['contactPerson.firstname'].message === 'invalid firstname'
		))
	) ? true : false;

	var isFirstnameMissingError = (
		err.name === 'ValidationError' &&
		((
			err.errors['name.firstname'] &&
			err.errors['name.firstname'].type === 'required'
		) || (
			err.errors['contactPerson.firstname'] &&
			err.errors['contactPerson.firstname'].type === 'required'
		))
	) ? true : false;

	var isSurnameInvalidError = (
		err.name === 'ValidationError' &&
		((
			err.errors['name.surname'] &&
			err.errors['name.surname'].message === 'invalid surname'
		) || (
			err.errors['contactPerson.surname'] &&
			err.errors['contactPerson.surname'].message === 'invalid surname'
		))
	) ? true : false;

	var isSurnameMissingError = (
		err.name === 'ValidationError' &&
		((
			err.errors['name.surname'] &&
			err.errors['name.surname'].type === 'required'
		) || (
			err.errors['contactPerson.surname'] &&
			err.errors['contactPerson.surname'].type === 'required'
		))
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

	var isDealershipNameMissingError = (
		err.name === 'ValidationError' &&
		err.errors.name &&
		err.errors.name.type === 'required'
	) ? true : false;

	var isStreetAddressMissingError = (
		err.name === 'ValidationError' &&
		err.errors.street &&
		err.errors.street.type === 'required'
	) ? true : false;

	var isProvinceMissingError = (
		err.errors &&
		err.errors['address.province']
	) ? true : false;

	var isTownMissingError = (
		err.errors &&
		err.errors['address.town']
	) ? true : false;

	var isAccountError = (
		isEmailDuplicateError ||
		isEmailInvalidError ||
		isEmailMissingError ||
		isPasswordError
	) ? true : false;

	var isNameError = (
		isFirstnameInvalidError ||
		isFirstnameMissingError ||
		isSurnameInvalidError ||
		isSurnameMissingError ||
		isDealershipNameMissingError
	) ? true : false;

	var isContactNumbersError = (
		isContactNumbersInvalidError ||
		isContactNumbersMissingError
	) ? true : false;

	var isLocationError = (
		isStreetAddressMissingError ||
		isProvinceMissingError ||
		isTownMissingError
	) ? true : false;

	var isDetailsError = (
		isNameError ||
		isContactNumbersError ||
		isLocationError
	) ? true : false;

	var isSellerError = (
		isAccountError ||
		isDecallbacksError
	) ? true : false;

	var isCreationDetailsError = (
		isDetailsError &&
		seller
	) ? true : false;

	var validationErrors = {};

	var remove = function (seller) {
		Seller.findByIdAndRemove(seller._id, function (err) {
			if (err) {
				handleErrors(err, seller);
			}
		});
	};

	if (isEmailDuplicateError) {
		validationErrors.emailError = 'The email address has been registered already.';
	} else if (isEmailInvalidError) {
		validationErrors.emailError = 'The email address is invalid.';
	} else if (isEmailMissingError) {
		validationErrors.emailError = 'An email address is required.';
	}

	if (isPasswordError) {
		validationErrors.passwordError = 'A password is required.';
	}

	if (isSellerTypeMissingError) {
		validationErrors.isSellerTypeError = true;
	}

	if (isFirstnameInvalidError) {
		validationErrors.firstnameError = "Use only letters, spaces, hyphens (-) and apostrophes (').";
	} else if (isFirstnameMissingError) {
		validationErrors.firstnameError = "A firstname is required.";
	}

	if (isSurnameInvalidError) {
		validationErrors.surnameError = "Use only letters, spaces, hyphesn (-) and apostrophes (').";
	} else if (isSurnameMissingError) {
		validationErrors.surnameError = 'A surname is required.';
	}

	if (isContactNumbersInvalidError) {
		validationErrors.contacNumbersError = 'Use only digits in a contact number, e.g. 0123431915.';
	} else if (isContactNumbersMissingError) {
		validationErrors.contacNumbersError = 'At least one contact number is required.';
	}

	if (isDealershipNameMissingError) {
		validationErrors.dealershipNameError = 'A dealership name is required.';
	}

	if (isStreetAddressMissingError) {
		validationErrors.streetError = 'A street address is required.';
	}

	if (isProvinceMissingError) {
		validationErrors.provinceError = 'A province is required.';
	}

	if (isTownMissingError) {
		validationErrors.townError = 'A town is required.';
	}

	if (isSellerError) {
		request.session.validationErrors = validationErrors;
		form(request, response);
		if (isCreationDetailsError) {
			remove(seller);
		}
	} else {
		main.showErrorPage(request, response);
	}
};

var sellers = module.exports = {
	/**
	 * @summary Responds to HTTP GET /sellers/add. Displays views/sellers/registration-form, unless a seller is
	 * logged-in, in which case it does nothing.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showRegistrationForm: function (request, response) {
		var isLoggedIn = request.session.seller ? true : false;
		if (!isLoggedIn) {
			Province.find(function (err, provinces) {
				if (err) {
					console.log('==================== BEGIN ERROR MESSAGE ====================');
					console.log(err);
					console.log('==================== END ERROR MESSAGE ======================');
					main.showErrorPage(request, response);
				} else {
					response.render('sellers/registration-form', {
						validationErrors: request.session.validationErrors,
						provinces: provinces,
						action: '/sellers/add',
						heading: 'New Seller',
						buttonCaption: 'Register',
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
					response.render('sellers/registration-form', {
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
		var frmSeller = request.body.seller;
		var isPrivateSeller = frmSeller.type === 'private seller';
		var isDealership = frmSeller.type === 'dealership';
		var privateSeller, dealership;

		var createPrivateSeller = function (seller, callback) {
			var privateSeller = new PrivateSeller({
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
				},
				account: seller._id
			});
			privateSeller.save(function (err, privateSeller) {
				if (err) {
					return callback(err, seller);
				}
				return callback(null, seller, privateSeller);
			});
		};

		var createDealership = function (seller, callback) {
			var dealership = new Dealership({
				name: sanitize(frmSeller.dealershipName),
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
				account: seller._id
			});
			dealership.save(function (err, dealership) {
				if (err) {
					return callback(err, seller);
				}
				return callback(null, seller, dealership);
			});
		};

		var createSeller = function (callback) {
			var seller = new Seller({
				emailAddress: frmSeller.emailAddress,
				passwordHash: frmSeller.password
			});
			seller.save(function (err, seller) {
				if (err) {
					return callback(err);
				}
				if (isPrivateSeller) {
					createPrivateSeller(seller, callback);
				} else if (isDealership) {
					createDealership(seller, callback);
				} else {
					return callback(new Error('Seller type must be specified.'), seller);
				}
			});
		};

		createSeller(function (err, seller, privateOrDealer) {
			if (err) {
				handleErrors(err, seller, sellers.showRegistrationForm);
			} else {
				if (isPrivateSeller) {
					dealership = null;
					privateSeller = privateOrDealer;
				} else if (isDealership) {
					dealership = privateOrDealer;
					privateSeller = null;
				}
				login.setSession(request, seller, dealership, privateSeller, function () {
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
			response.render('sellers/profile-page', {
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
		var frmSeller = request.body.seller;
		var ssnSeller = request.session.seller;

		var ssnPrivateSeller = request.session.privateSeller;
		var ssnDealership = request.session.dealership;

		var isEmailChanged = frmSeller.emailAddress.toLowerCase().trim() !== ssnSeller.emailAddress;
		var isPasswordChanged = frmSeller.password !== "";

		var isRemainPrivate = (
			frmSeller.type === 'privateSeller' &&
			ssnPrivateSeller
		) ? true : false;

		var isRemainDealer = (
			frmSeller.type === 'dealership' &&
			ssnDealership
		) ? true : false;

		var isChangeToDealer = (
			frmSeller.type === 'dealership' &&
			ssnPrivateSeller
		) ? true : false;

		var isChangeToPrivate = (
			frmSeller.type === 'privateSeller' &&
			ssnDealership
		) ? true : false;

		var callback = function (err) {
			if (err) {
				handleErrors(err, null, sellers.showEditForm);
			} else {
				sellers.showProfile(request, response);
				if (isEmailChanged) {
					email.sendEmail(request, response);
				}
			}
		};

		var updateSeller = function (callback) {
			if (isEmailChanged && isPasswordChanged) {
				Seller.findByIdAndUpdate(ssnSeller._id, {
					$set: {
						emailAddress: frmSeller.emailAddress.toLowerCase().trim,
						passwordHash: frmSeller.password,
						emailAddressVerified: false
					}
				}, function (err, seller) {
					if (err) {
						return callback(err);
					}
					ssnSeller.emailAddress = seller.emailAddress;
					ssnSeller.passwordHash = seller.passwordHash;
					return callback(null);
				});
			} else if (isEmailChanged) {
				Seller.findByIdAndUpdate(ssnSeller._id, {
					$set: {
						emailAddress: frmSeller.emailAddress.toLowerCase().trim(),
						emailAddressVerified: false
					}
				}, function (err, seller) {
					if (err) {
						return callback(err);
					}
					ssnSeller.emailAddress = seller.emailAddress;
					return callback(null);
				});
			} else if (isPasswordChanged) {
				Seller.findByIdAndUpdate(ssnSeller._id, {
					$set: {
						passwordHash: frmSeller.password,
					}
				}, function (err, seller) {
					if (err) {
						return callback(err);
					}
					ssnSeller.passwordHash = seller.passwordHash;
					return callback(null);
				});
			} else {
				return callback(null);
			}
		};

		var updatePrivateSeller = function (callback) {
			PrivateSeller.findByIdAndUpdate(ssnPrivateSeller._id, {
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
			}, function (err, privateSeller) {
				if (err) {
					return callback(err);
				}
				request.session.privateSeller = privateSeller;
				updateSeller(callback);
			});
		};

		var updateDealership = function (callback) {
			Dealership.findByIdAndUpdate(ssnDealership._id, {
				$set: {
					name: sanitize(frmSeller.dealershipName),
					contactPerson: {
						firstname: sanitize(frmSeller.firstname),
						surname: sanitize(frmSeller.surname)
					},
					contactNumbers: [
						sanitize(frmSeller.telephone),
						sanitize(frmSeller.cellphone)
					],
					address: {
						street: sanitize(frmSeller.streetAddress1),
						suburb: sanitize(frmSeller.streetAddress2),
						town: sanitize(frmSeller.town),
						province: sanitize(frmSeller.province)
					}
				}
			}, function (err, dealership) {
				if (err) {
					return callback(err);
				}
				request.session.dealership = dealership;
				updateSeller(callback);
			});
		};

		var removePrivateSeller = function (id, callback) {
			PrivateSeller.findByIdAndRemove(id, function (err) {
				if (err) {
					/** @todo Write to a special log file that this privateSeller has to be removed manually, or that a
					 * clean-up script has to be run.
					 */
					return callback(err);
				}
				updateSeller(callback);
			});
		};

		var removeDealership = function (id, callback) {
			Dealership.findByIdAndRemove(id, function (err) {
				if (err) {
					/** @todo Write to a special log that this dealership has to be removed manually, or that a
					 * clean-up script has to be run.
					 */
					return callback(err);
				}
				updateSeller(callback);
			});
		};

		var changePrivateToDealer = function (callback) {
			var dealership = new Dealership({
				_id: ssnPrivateSeller._id,
				name: sanitize(frmSeller.dealershipName),
				contactPerson: {
					firstname: sanitize(frmSeller.firstname),
					surname: sanitize(frmSeller.surname)
				},
				contactNumbers: [
					sanitize(frmSeller.telephone),
					sanitize(frmSeller.cellphone)
				],
				address: {
					street: sanitize(frmSeller.streetAddress1),
					suburb: sanitize(frmSeller.streetAddress2),
					town: sanitize(frmSeller.town),
					province: sanitize(frmSeller.province)
				},
				account: ssnPrivateSeller.account
			});
			dealership.save(function (err, dealership) {
				if (err) {
					return callback(err);
				}
				request.session.dealership = dealership;
				request.session.privateSeller = null;
				removePrivateSeller(dealership._id, callback);
			});
		};

		var changeDealerToPrivate = function (callback) {
			var privateSeller = new PrivateSeller({
				_id: ssnDealership._id,
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
				},
				account: ssnDealership.account
			});
			privateSeller.save(function (err, privateSeller) {
				if (err) {
					return callback(err);
				}
				request.session.privateSeller = privateSeller;
				request.session.dealership = null;
				removeDealership(privateSeller._id, callback);
			});
		};

		if (isRemainPrivate) {
			updatePrivateSeller(callback);
		} else if (isRemainDealer) {
			updateDealership(callback);
		} else if (isChangeToDealer) {
			changePrivateToDealer(callback);
		} else if (isChangeToPrivate) {
			changeDealerToPrivate(callback);
		}
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