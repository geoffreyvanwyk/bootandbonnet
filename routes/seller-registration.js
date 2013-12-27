/*jshint node: true*/

'use strict';

/**
 * @file routes/seller-registration.js
 * @summary Component: Seller Registration. Contains routes that handle registration of new sellers and modification of 
 * existing sellers.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.

/* Import built-in modules. */
var path = require('path'); // For working wiht file paths.

/* Import libraries. */
var sanitize = require('../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/* Import models. */
var Province = require('../models/provinces');
var Seller = require('../models/sellers');
var User = require('../models/users');
var Vehicle = require('../models/vehicles');

/* Import functions. */
var verify = require('./email-address-verification');
var main = require('./main');

/**
 * @summary Handles all the errors occurring in the seller-registration module.
 * 
 * @param {object} err An error object.
 * @param {object} request An HTTP request object received from the express.get() or express.post() method.
 * @param {object} response An HTTP response object received from the express.get() or express.post() method.
 * @param {object} user A user object.
 * @param {function} form A routing function.
 * 
 * @returns {undefined}
 */
var handleErrors = function (err, request, response, user, form) {
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
	);

	var isNameError = (
		isFirstnameInvalidError ||
		isFirstnameMissingError ||
		isSurnameInvalidError ||
		isSurnameMissingError
	);

	var isContactNumbersError = (
		isContactNumbersInvalidError ||
		isContactNumbersMissingError
	);

	var isLocationError = isProvinceMissingError ||	isTownMissingError;

	var isSellerError = (
		isNameError ||
		isContactNumbersError ||
		isLocationError
	);

	var isPersonError =	isUserError || isSellerError;

	var isAddProfileError = ( // Error encountered by addProfile function.
		isPersonError &&
		user
	) ? true : false;

	var validationErrors = {
		emailError: '',
		emailAlertType: '',
		passwordError: '',
		passwordAlertType: '',
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
				handleErrors(err, request, response, user);
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

/**
 * @summary Returns true, if a user is authorized to perform an action (view, edit, or remove) on a seller profile; 
 * otherwise, it displays an error message, then returns false.
 * 
 * @description An authorized user is:
 * (1) Logged-in as a seller (var isLoggedIn).
 * (2) The owner of the profile upon which he/she is attempting to perform an action (var isOwnProfile).
 * 
 * @param {string} action The type of action performed on a seller profile: view, edit, or remove.
 * @param {string} request An HTTP request object received from the express.get() or express.post() method.
 * 
 * @returns {boolean}
 */
var isAuthorizedTo = function (action, request, response) {
	var isLoggedIn = request.session.seller ? true : false;
	/* The request.session.seller._id expression needs to be guarded by the isLoggedIn variable, because, if it was not,
	 * and the seller property of request.session did not exist, the JavaScript interpreter would raise a reference 
	 * error.
	 */
	var loggedInId = isLoggedIn && request.session.seller._id.toString();
	var profileId = request.params.sellerId;
	var isOwnProfile = loggedInId === profileId;
	var isAuthorized = isLoggedIn && isOwnProfile;
	var reasonForError;
	
	var displayError = function () {
		if (!isLoggedIn) {
			reasonForError = 'you are not logged-in.';
		} else if (!isOwnProfile) {
			reasonForError = 'it is not your own profile.';
		}
		var specialError = new Error(
			'You cannot '
			.concat(action)
			.concat(' the profile, because ')
			.concat(reasonForError)
		);
		request.session.specialError = specialError;
		handleErrors(specialError, request, response);
		return false;
	};
	
	return isAuthorized || displayError();
};

/**
 * @summary Returns true, if a seller is logged-in; otherwise, it displays an error message, then returns false.
 *  
 * @param {object} request An HTTP request object received from the express.get() or express.post() method.
 * @param {object} response An HTTP response object received from the express.get() or express.post() method.
 *  
 * @returns {boolean}
 */
var isLoggedIn = function (request, response) {
	var displayError = function () {
		var specialError = new Error('You cannot add a new seller profile, because you are already logged-in.');
		request.session.specialError = specialError;
		handleErrors(specialError, request, response);
		return true;
	};
	if (request.session.seller) {
		return displayError();
	}
	return false;
};

var sellers = module.exports = {
	/**
	 * @summary Responds to HTTP GET /sellers/add. Displays views/seller-registration-form.ejs.
	 *
	 * @description Preconditions:
	 * (1) No seller must be logged-in (function isLoggedIn).
	 * 
	 * Postconditions:
	 * (1) The views/seller-registration-form.ejs is displayed.
	 * (2) If the form is being redisplayed, because there was something wrong with one of the inputs, then the previous
	 * inputs (var frmUser; var frmSeller) are prefilled.
	 * 
	 * Error handling:
	 * (1) If a seller is logged-in, an error message is displayed stating why the request cannot be fulfilled 
	 * (function isLoggedIn).
	 * (2) All errors are handled by the handleErrors function.
	 * 
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 * @param {object} specialError An object passed by the handleErrors function of routes/vehicle-registration.js.
	 *
	 * @returns {undefined}
	 */
	showRegistrationForm: function (request, response) {
		if (!isLoggedIn(request, response)) {
			var frmUser = request.body.user;
			var frmSeller = request.body.seller;
			var sellerType = '';
			
			if (frmSeller) {
				sellerType = frmSeller.dealershipName === '' ? 'privateSeller' : 'dealership';
			}
			
			Province.find(function (err, provinces) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.render('seller-registration-form', {
						/* The specialError is created if a user tries to register a vehicle without being logged-in. */
						specialError: request.session.specialError || {
							message: '',
							alertDisplay: 'none'
						},
						validationErrors: request.session.validationErrors || {
							emailError: '',
							emailAlertType: '',
							passwordError: '',
							passwordAlertType: '',
							firstnameError: '',
							firstnameAlertType: '',
							surnameError: '',
							surnameAlertType: '',
							contactNumbersError: '',
							contactNumbersAlertDisplay: 'none',
							provinceError: '',
							provinceAlertType: '',
							townError: '',
							townAlertType: '', 
							locationAlertDisplay: 'none'
						},
						provinces: provinces,
						action: '/sellers/add',
						heading: 'New Seller',
						buttonCaption: 'Register',
						user: frmUser || {
							emailAddress: '',
							password: ''
						},
						seller: frmSeller || {
							dealershipName: '',
							contactPerson: {
								firstname: '',
								surname: ''
							},
							contactNumbers: ['', ''],
							address: {
								street: '',
								suburb: '',
								town: '',
								province: ''
							}
						},
						sellerType: sellerType, 
						isLoggedIn: false 
					}, function (err, html) {
						request.session.validationErrors = null;
						request.session.specialError = null;
						if (err) {
							handleErrors(err, request, response);
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
	 * @description Preconditions:
	 * (1) The user must be logged-in (function isLoggedin).
	 * 
	 * Postconditions:
	 * (1) A new user document is created in the users database collection, using the details (var frmUser) entered into the 
	 * registration form (views/seller-registration-form.ejs).
	 * (2) A new seller document is created in the sellers database collection, using the details (var frmSeller) 
	 * entered into the registration form.
	 * (3) The new seller is logged-in using session cookies (request.session.user; request.session.seller) containing 
	 * the details of the newly registered seller.
	 * (4) The new seller's views/seller-profile-page.ejs is displayed.
	 * 
	 * Algorithm:
	 * (1) The new user should be created first, because a seller cannot exist without an associated user.
	 * 
	 * Error handling:
	 * (1) If a seller is logged-in, an error message is displayed (function isLoggedIn).
	 * (2) All errors are handled by the handleErrors function.
	 * 
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	add: function (request, response) {
		if (!isLoggedIn(request, response)) {
			var frmUser = request.body.user;
			var frmSeller = request.body.seller;

			var createSeller = function (user, callback) {
				var seller = new Seller({
					dealershipName: frmSeller.dealershipName,
					contactPerson: {
						firstname: sanitize(frmSeller.contactPerson.firstname),
						surname: sanitize(frmSeller.contactPerson.surname)
					},
					contactNumbers: [
						sanitize(frmSeller.contactNumbers[0]),
						sanitize(frmSeller.contactNumbers[1])
					],
					address: {
						street: sanitize(frmSeller.address.street),
						suburb: sanitize(frmSeller.address.suburb),
						town: sanitize(frmSeller.address.town),
						province: sanitize(frmSeller.address.province)
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

			createUser(function (err, user, seller) {
				if (err) {
					handleErrors(err, request, response, user, sellers.showRegistrationForm);
				} else {
					request.session.user = {
						_id: user._id,
						emailAddress: user.emailAddress,
						password: '', 
						isEmailAddressVerified: false
					};
					request.session.seller = seller;
					response.redirect(302, path.join('/sellers', seller._id.toString(), 'view'));
					verify.sendLink(request, response);
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/view. Displays the views/seller-profile-page.ejs for the
	 * logged-in seller.
	 * 
	 * @description Preconditions:
	 * The user must be authorised to view the profile (function isAuthorized). The reason for this precondition is that 
	 * a seller profile displays the email address of the seller.
	 * 
	 * Postconditions:
	 * (1) The logged-in seller's profile page is displayed.
	 * 
	 * Error handling:
	 * (1) If the user attempting to view the profile is not authorized to do so, an error message is displayed 
	 * stating why his/her request cannot be fulfilled (function isAuthorizedTo).
	 * 
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 * @param {function} callback A callback function.
	 *
	 * @returns {undefined} Returns the request and response objects to a callback function.
	 */
	show: function (request, response, callback) {
		if (isAuthorizedTo('view', request, response)) {
			response.render('seller-profile-page', {
				user: request.session.user,
				seller: request.session.seller,
				dealerDisplay: request.session.seller.dealershipName === '' ? 'none': '',
				privateSellerDisplay: request.session.seller.dealershipName === '' ? '': 'none',
				isLoggedIn: true
			});
			if (typeof callback === 'function') {
				return callback(request, response);
			}
		}
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/edit. Displays views/seller-registration-form.ejs, with the 
	 * logged-in seller's details prefilled.
	 *
	 * @description Preconditions:
	 * The user must be authorised to edit the profile (function isAuthorizedTo).
	 * 
	 * Postconditions:
	 * (1) The views/seller-registration-form.ejs is displayed, with the seller's details prefilled, as stored in the 
	 * session cookie (var ssnUser; var ssnSeller).
	 * (2) If the form is redisplayed, because there was something wrong with one of the new inputs, then the previous 
	 * inputs (var frmUser; var frmSeller) are prefilled.
	 * 
	 * Error handling:
	 * (1) If the user attempting to edit the profile is not authorised to do so, an error message is displayed 
	 * stating why his/her request cannot be fulfilled. (function isAuthorizedTo).
	 * (2) All errors are handled by the handleErrors function.
	 * 
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	showEditForm: function (request, response) {
		if (isAuthorizedTo('edit', request, response)) {
			var frmUser = request.body.user;
			var frmSeller = request.body.seller;
			var ssnUser = request.session.user;
			var ssnSeller = request.session.seller;
			var sellerType;
			
			if (frmSeller) {
				sellerType = frmSeller.dealershipName === '' ? 'privateSeller' : 'dealership';
			} else if (ssnSeller) {
				sellerType = ssnSeller.dealershipName === '' ? 'privateSeller' : 'dealership';
			}
			Province.find(function (err, provinces) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.render('seller-registration-form', {
						specialError: {
							message: '',
							alertDisplay: 'none'
						},
						validationErrors: request.session.validationErrors || {
							emailError: '',
							emailAlertType: '',
							passwordError: '',
							passwordAlertType: '',
							firstnameError: '',
							firstnameAlertType: '',
							surnameError: '',
							surnameAlertType: '',
							contactNumbersError: '',
							contactNumbersAlertDisplay: 'none',
							provinceError: '',
							provinceAlertType: '',
							townError: '',
							townAlertType: '', 
							locationAlertDisplay: 'none'
						},
						provinces: provinces,
						action: path.join('/sellers', ssnSeller._id.toString(), 'edit'),
						heading: 'Edit Seller',
						buttonCaption: 'Save Changes',
						user: frmUser || ssnUser, 
						seller: frmSeller || ssnSeller,
						sellerType: sellerType,
						isLoggedIn: true
					}, function (err, html) {
						request.session.validationErrors = null;
						if (err) {
							handleErrors(err, request, response);
						} else {
							response.send(html);
						}
					});
				}
			});
		}
	},	
	/**
	 * @summary Responds to HTTP POST /seller/:sellerId/edit. Edits the logged-in seller's' profile, then displays it 
	 * (views/seller-profile-page.ejs).
	 * 
	 * @description Preconditions:
	 * The user must be authorised to edit the profile (function isAuthorized).
	 *
	 * Postconditions:
	 * (1) The seller document associated with the logged-in seller (var ssnSeller) is updated in the sellers database 
	 * collection (function updateSeller) with the details (var frmSeller) entered into the edit form 
	 * (views/seller-registration-form.ejs).
	 * (2) The user document associated with the logged-in user (var ssnUser) is updated in the users database 
	 * collection (function updateUser) with the details (var frmUser) entered into the edit form.
	 * (3) If the user changed his/her email address (var isEmailChanged), an email message should be sent to the user, 
	 * asking him/her to verify the address.
	 * (4) The session cookies (var ssnUser; var ssnSeller) for the logged-in user and logged-in seller should be 
	 * updated with the new details.
	 * (5) The logged-in seller's profile page is displayed.
	 * 
	 * Algorithm: 
	 * (1) If the email address has been changed, it is necessary to set the isEmailAddressVerified property in the 
	 * associated user document to false; therefore, it is necessary to check whether the email address has been changed 
	 * (var isEmailChanged).
	 * (2) If the email address has not changed, it is not necessary to update the email address; therefore, a separate 
	 * function should be used for updating the email address only (function updateEmailAddress).
	 * (3) The password and confirmPassword fields of the edit form are not prefilled with the plain text of the user's
	 * password, but are empty. This means that if the user did not change his/her password, the password property of 
	 * the HTTP POST request (frm.password) will be an empty string, which cannot automatically be used to update the 
	 * user's password. The password should only be updated if the password has changed (var isPasswordChanged), and a 
	 * separate function should be used for updating the password only (function updatePassword). The updateUser 
	 * function could composes the updateEmailAddress and updatePassword functions.
	 * (4) Nothing special needs to be done when any of the seller properties are updated; therefore, all the seller
	 * properties can be updated in one function.
	 * 
	 * Error handling:
	 * (1) If the user attempting to edit the profile is not authorised to do so, an error message is displayed 
	 * stating why his/her request cannot be fulfilled (function isAuthorizedTo).
	 * (2) All errors are handled by the handleErrors() function, which handles all errors for the 
	 * seller-registration.js module.
	 * 
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	edit: function (request, response) {
		if (isAuthorizedTo('edit', request, response)) {
			var frmUser = request.body.user;
			var frmSeller = request.body.seller;
			
			var ssnUser = request.session.user;
			var ssnSeller = request.session.seller;

			var isEmailChanged = frmUser.emailAddress.toLowerCase().trim() !== ssnUser.emailAddress;
			var isPasswordChanged = frmUser.password !== "";

			var updatePassword = function (callback) {
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
			};
			
			var updateEmailAddress = function (callback) {
				User.findByIdAndUpdate(ssnUser._id, {
					$set: {
						emailAddress: frmUser.emailAddress.toLowerCase().trim(),
						isEmailAddressVerified: false
					}
				}, function (err, user) {
					ssnUser.emailAddress = user.emailAddress;
					if (!isPasswordChanged) {
						return callback(null);
					}
					updatePassword(callback);
				});
			};
			
			var updateUser = function (callback) {
				if (isEmailChanged) {
					updateEmailAddress(callback);
				} else if (isPasswordChanged) {
					updatePassword(callback);
				} else {
					return callback(null);
				}
			};

			var updateSeller = function (callback) {
				Seller.findByIdAndUpdate(ssnSeller._id, {
					$set: {
						dealershipName: sanitize(frmSeller.dealershipName),
						contactPerson: {
							firstname: sanitize(frmSeller.contactPerson.firstname),
							surname: sanitize(frmSeller.contactPerson.surname)
						},
						contactNumbers: [
							sanitize(frmSeller.contactNumbers.telephone),
							sanitize(frmSeller.contactNumbers.cellphone)
						],
						address: {
							street: sanitize(frmSeller.address.street),
							suburb: sanitize(frmSeller.address.suburb),
							town: sanitize(frmSeller.address.town),
							province: sanitize(frmSeller.address.province)
						}
					}
				}, function (err, seller) {
					if (err) {
						return callback(err);
					}
					request.session.seller = seller;
					updateUser(callback);
				});
			};

			updateSeller(function (err) {
				if (err) {
					handleErrors(err, request, response, null, sellers.showEditForm);
				} else {
					response.redirect(302, path.join('/sellers', request.session.seller._id.toString(), 'view'));
					if (isEmailChanged) {
						verify.sendLink(request, response);
					}
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP GET /seller/:sellerId/remove. Removes the logged-in seller's profile as well as all 
	 * associated vehicle profiles; then displays the home page.
	 *
	 * @description Preconditions:
	 * The user must be authorised to remove the seller (function isAuthorized).
	 * 
	 * Postconditions:
	 * (1) All vehicle documents associated with the logged-in seller are deleted from the vehicles database collection 
	 * (function deleteVehicles).
	 * (2) The seller document associated with the logged-in seller is deleted from the sellers database collection 
	 * (function deleteSeller).
	 * (3) The user document associated with the logged-in seller is deleted from the users database collection 
	 * (function deleteUser)
	 * (4) The seller is logged-out (request.session.user and request.session.seller are set to null).
	 * (5) Order documents associated with the seller are NOT deleted, because they must be kept for financial 
	 * accounting.
	 * (6) Item documents associated with the seller's vehicles are NOT deleted, because the must be kept for 
	 *  financial accounting.
	 *
	 * Algorithm:
	 * (1) Every vehicle must be associated with a seller; therefore, the seller cannot be deleted before the vehicles.
	 * (2) Every seller must be associated with a user; therefore, the user cannot be deleted before the seller.
	 * (3) Therefore, delete the vehicles first, then the seller, then the user.
	 * 
	 * Error handling:
	 * (1) If the user attempting the removal of the profile is not authorised to do so, an error message is displayed 
	 * stating why his/her request cannot be fulfilled (isAuthorizedTo).
	 * (2) All errors are handled by the handleErrors() function, which handles all errors for the 
	 * seller-registration.js module.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns {undefined}
	 */
	remove: function (request, response) {
		if (isAuthorizedTo('remove', request, response)) {
			var deleteUser = function (callback) {
				User.findByIdAndRemove(request.session.user._id, function (err) {
					if (err) {
						return callback(err);
					}
					request.session.user = null;
					return callback(null);
				});
			};

			var deleteSeller = function (callback) {
				Seller.findByIdAndRemove(request.session.seller._id, function (err) {
					if (err) {
						return callback(err);
					}
					request.session.seller = null;
					deleteUser(callback);
				});
			};

			var deleteVehicles = function (callback) {
				Vehicle.remove({seller: request.session.seller._id}, function (err) {
					if (err) {
						return callback(err);
					}
					deleteSeller(callback);
				});
			};
			
			deleteVehicles(function (err) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					main.showHomePage(request, response);
				}
			});
		} 
	}
};