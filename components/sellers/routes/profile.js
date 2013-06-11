"use strict";
/**
 * Handles the profile.ejs and emailVerified.ejs views.
 */

var mongoose = require('mongoose');
var User = require('../models/users').User;
var PrivateSeller = require('../models/sellers').PrivateSeller;
var Dealership = require('../models/dealerships').Dealership;

var async = require('async');
var bcrypt = require('bcrypt'); // For hashing and comparing passwords.
var dealershipPrototype = require('../models/dealerships').dealership; // For working with the dealerships database table.
var email = require('../../../email').email; // For sending emails.
var emailVerified = require('./emailVerified');
var home = require('../../../routes/home').index;
var locationPrototype = require('../../../models/locations').location; // For working with the locations database table.
var register = require('./register').register; // For working withe the register.ejs view.
var sanitize = require('sanitizer').sanitize; // For removing scripts from user input.
var sellerPrototype = require('../models/sellers').seller; // For working with the sellers database table.
var userPrototype = require('../models/users').user; // For working with the users database table.
var provincesPrototype = require('../../../models/locations').provinces;	// For working with the locations database tabe.


/**
 * Responds to HTTP GET /seller/view. Displays the seller's profile.
 *
 * @param   {object}    request     An HTTP request object received from the express.get() method.
 * @param   {object}    response    An HTTP response object received from the express.get() method.
 *
 * @return  {function}	Returns the request and response objects to a callback function.
 */
function showProfile(request, response, callback) {
	if (request.session.dealership === null) {
		var seller = request.session.privateSeller;
		var fullname = seller.name.firstName.concat(' ').concat(seller.name.surname); 
		var dealershipName = '';
		var streetAddress1 = '';
		var streetAddress2 = '';
	} else {
		var seller = request.session.dealership;
		var fullname = seller.contactPerson.firstName.concat(' ').concat(seller.contactPerson.surname);
		var dealershipName = seller.name;
		var streetAddress1 = seller.address.street;
		var streetAddress2 = seller.address.suburb;
	}
	response.render('profile', {
		method: 'delete',
		sellerType: request.session.dealership ? 'dealership' : 'privateSeller',
		email: request.session.user.emailAddress,
		fullname: fullname,
		telephone: seller.telephone,
		cellphone: seller.cellphone,
		dealershipName: dealershipName,
		streetAddress1: streetAddress1,
		streetAddress2: streetAddress2,
		province: seller.address.province,
		town: seller.address.town,
		townId: 1,
		loggedIn: true
	});
	if (typeof(callback) === 'function') {
		return callback(request, response);
	}
}

/**
 * Responds to HTTP POST /seller/view. Inserts a new user into the users database table, a new dealership into the
 * dealerships database table (if the seller type is 'dealership'), a new seller into the sellers database table,
 * creates a seller session object, logs-in the new seller, and displays the seller profile page.
 *
 * @param   {object}    request     An HTTP request object received from the express.post() method.
 * @param   {object}    response    An HTTP response object received from the express.post() method.
 *
 * @return  {undefined}
 */
function addProfile(request, response) {
	var slr = request.body.seller;

	mongoose.connect('mongodb://localhost/bootandbonnet');
	mongoose.connection.on('error', console.error.bind(console, 'Error: Failed to connect to MongoDB.'));
	mongoose.connection.once('open', function () {
		bcrypt.hash(slr.password, 10, function(err, hash) {
			if (err) {
				throw err;
			}
			var user = new User({
				emailAddress: slr.email,
				passwordHash: hash
			});
			user.save(function (err, user) {
				if (err) {
					throw err;
				}
				if (slr.type === 'privateSeller') {
					var privateSeller = new PrivateSeller({
						name: {
							firstName: slr.firstname,
							surname: slr.surname
						},
						telephone: slr.telephone,
						cellphone: slr.cellphone,
						address: {
							town: slr.town,
							province: slr.province,
							country: 'South Africa'
						},
						userId: user._id
					});
					privateSeller.save(function (err, privateSeller) {
						if (err) {
							throw err;
						}
						var dealership = null;
						setSession(request, response, user, dealership, privateSeller, function () {
							showProfile(request, response, sendEmail);
						});
					});	
				} else {
					var dealership = new Dealership({
						name: slr.dealershipName,
						contactPerson: {
							firstName: slr.firstname,
							surname: slr.surname
						},
						address: {
							street: slr.streetAddress1,
							suburb: slr.streetAddress2,
							town: slr.town,
							province: slr.province,
							country: 'South Africa'
						},
						telephone: slr.telephone,
						cellphone: slr.cellphone,
						userId: user._id
					});
					dealership.save(function (err, dealership) {
						if (err) {
							throw err;
						}
						var privateSeller = null;
						setSession(request, response, user, dealership, privateSeller, function () {
							showProfile(request, response, sendEmail);
						});
					});
				}
			})
		});
	});
}

/**
 * Responds to HTTP PUT /seller/view. Edits the user profile, then displays it.
 *
 * @param   {object}    request     An HTTP request object received from the express.put() method.
 * @param   {object}    response    An HTTP response object received from the express.put() method.
 *
 * @return  {undefined}
 */
function editProfile(request, response) {
	var slr = request.body.seller;
	var ss = request.session.seller;
	var isEmailChanged = slr.email.toLowerCase() !== ss.email.toLowerCase();

	function updateUser(callback) {
		bcrypt.hash(slr.password, 10, function (err, hash) {
			if (err) {
				return callback(err);
			}
			var user = Object.create(userPrototype);
			var isPasswordChanged = slr.password !== "";
			var currentPasswordHash = ss.passwordHash;
			var newPasswordHash = hash;
			user.id = sanitize(ss.userId);
			user.emailAddress = sanitize(slr.email);
			user.passwordHash = isPasswordChanged ? newPasswordHash : currentPasswordHash;
			user.emailAddressVerified = !isEmailChanged;
			user.update(callback);
		});
	}

	function updateDealership(callback) {
		switch (slr.type) {
			case "privateSeller":
				var dealership = Object.create(dealershipPrototype);
				dealership.id = 1;
				return callback(null, dealership);
				break;
			case "dealership":
				var dealership = Object.create(dealershipPrototype);
				dealership.id = ss.dealershipId;
				dealership.name = sanitize(slr.dealershipName);
				dealership.streetAddress1 = sanitize(slr.streetAddress1);
				dealership.streetAddress2 = sanitize(slr.streetAddress2);
				dealership.province = sanitize(slr.province);
				dealership.town = sanitize(slr.town);
				dealership.townId = sanitize(slr.townId);
				dealership.update(callback)
				break;
		}
	}

	function updateSeller(user, callback) {
		updateDealership(function (err, dealership) {
			if (err) {
				return callback(err);	
			}
			var seller = Object.create(sellerPrototype); 
			seller.id = sanitize(ss.sellerId);
			seller.firstname = sanitize(slr.firstname);
			seller.surname = sanitize(slr.surname);
			seller.telephone = sanitize(slr.telephone);
			seller.cellphone = sanitize(slr.cellphone);
			seller.dealershipId = dealership.id;
			seller.userId = user.id;
			seller.update(function (err, seller) {
				if (err) {
					return callback(err);
				}
				return callback(null, user, dealership, seller);
			});
		});
	}

	function updateEntities(callback) {
		updateUser(function (err, user) {
			if (err) {
				return callback(err);
			}
			updateSeller(user, callback);
		});
	}

	function updateProfile(callback) {
		updateEntities(function (err, user, dealership, seller) {
			if (err) {
				return callback(err);
			}
			setSession(request, response, user, dealership, seller, callback);
		});
	}

	updateProfile(function(err) {
		if (err && err.code === "ER_DUP_ENTRY") {
			register.show('new', 'New Seller', 'post', 'Register', 'Email address already registered.',
				slr.type, slr.email, '', slr.firstname, slr.surname, slr.telephone, slr.cellphone,
				slr.dealershipName, slr.streetAddress1, slr.streetAddress2, slr.province, slr.town,
				slr.townId, slr.loggedIn, response);
		} else if (err) {
			throw err;
		} else {
			showProfile(request, response, function () {
				if (isEmailChanged) {
					sendEmail(request);
				}
			});
		}
	});
}

/**
 * Responds to HTTP DELETE /seller/view. Deletes the seller profile and all related rows in the database. Displays
 * the home page.
 *
 * @param   {object}    request     An HTTP request object received from the express.del() method.
 * @param   {object}    response    An HTTP response object received from the express.del() method.
 *
 * @return  {undefined}
 */
function removeProfile(request, response) {
	var ss = request.session.seller;

	function deleteSeller(callback) {
		var seller = Object.create(sellerPrototype);
		seller.id = ss.sellerId;
		seller.del(callback);
	}
	
	function deleteUser(callback) {
		var user = Object.create(userPrototype);
		user.id = ss.userId;
		user.del(callback);
	}

	function deleteDealership(callback) {
		var dealership = Object.create(dealershipPrototype);
		dealership.id = ss.dealershipId;
		dealership.del(callback);
	}

	function deleteProfile(callback) {
		deleteSeller(function (err) {
			if (err) {
				return callback(err);
			}
			deleteUser(function (err) {
				if (err) {
					return callback(err);
				}
				deleteDealership(function (err) {
					if (err) {
						return callback(err);
					}
					return callback(null);
				});
			});
		});
	}

	deleteProfile(function (err) {
		if (err) {
			throw err;
		} else {
			request.session.seller = null;
			home(request, response);
		}
	});
}

/**
 * Creates a seller object as a property of the request.session object.
 *
 * @param   {object}    request		An HTTP request object received from the express HTTP method.
 * @param   {object}    response	An HTTP response object received from the express HTTP method.
 * @param	{object}	user		A user object.
 * @param	{object}	seller		A seller object.
 * @param	{object}	dealership	A dealership object.
 * @param	{function}	callback	The function which is called as soon as this function completes execution.
 *
 * @return  {function}	Returns its callback function with no arguments.
 */
function setSession(request, response, user, dealership, privateSeller, callback) {
	request.session.user = {
		id: user._id,
		emailAddress: user.emailAddress,
		passwordHash: user.passwordHash,
		dateAdded: user.dateAdded,
		emailAddressVerified: user.emailAddressVerified,
		loggedIn: true
	};
	if (dealership === null) {
		request.session.privateSeller = {
			id: privateSeller._id,
			name: privateSeller.name, 
			telephone: privateSeller.telephone,
			cellphone: privateSeller.cellphone,
			address: privateSeller.address,
			userId: privateSeller.userId
		};
		request.session.dealership = null;
	} else {
		request.session.dealership = {
			id: dealership._id,
			name: dealership.name,
			address: dealership.address,
			contactPerson: dealership.contactPerson,
			telephone: dealership.telephone,
			cellphone: dealership.cellphone,
			userId: dealership.userId
		};
	}
	if (typeof(callback) === "function") {
		if (callback.toString().indexOf("showHomePage") !== -1) {
			return callback(request, response);
		}
		return callback(null);
	}
}

/**
 * Sends an email to a user to verify the email address provided.
 *
 * @param	{string}	emailAddress	The email address provided by the seller.
 * @param	{function}	callback		The function which is called as soon as this function completes execution.
 *
 * @return	{undefined}
 *
 */
function sendEmail(request) {
	var emailAddress = request.session.user.emailAddress;
	bcrypt.hash(emailAddress, 10, function(err, hash) {
		if (err) {
			throw err;
		} else {
			var link = 'http://localhost:3000/seller/edit/verify-email/?email='
							.concat(encodeURIComponent(emailAddress))
							.concat('&hash=')
							.concat(hash);
			email.send({
				text: "Dear Sir/Madam,\n\n"
						.concat("Thank you for registering a BootandBonnet account.\n\n")
						.concat("In order to guarantee receiving important future emails regarding your account, ")
						.concat("you must verify your email address. ") 
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
 * Responds to HTTP GET /seller. It checks that the email address and the email hash in the query string match. It
 * then displays the emailVerification.ejs page.
 *
 * @param   {object}	request     An HTTP request object received from the express.get() method.
 * @param   {object}	response    An HTTP response object received from the express.get() method.
 *
 * @return  {undefined}	It returns nothing. It displays the emailVerification page.
 */
function verifyEmail(request, response) {
	var email = decodeURIComponent(request.query.email);
	var emailHash = request.query.hash;
	bcrypt.compare(email, emailHash, function(err, isMatch) {
		if (err) {
			throw err;
		} else if (isMatch) {
			var isUserLoggedIn = request.session.user && request.session.user.loggedIn;
			mongoose.connect('mongodb://localhost/bootandbonnet');
			mongoose.connection.once('open', function () {
				User.findOneAndUpdate({emailAddress: email}, {$set: {emailAddressVerified: true}}, function () {
					if (isUserLoggedIn) {
						request.session.user.emailAddressVerified = true;
					}
					emailVerified(request, response);
				});
			});
		}
	});
}

/**
 * Responds to HTTP GET /seller/add and /seller/edit. Displays the register form, to either add or edit a seller profile. If a 
 * seller is already logged-in, a new profile cannot be added, so the function 
 * will do nothing. If a seller is not logged-in, a profile cannot be edited, 
 * so the function will do nothing.
 *
 * @param   {object}	request     An HTTP request object received from the express.get() method.
 * @param   {object}	response    An HTTP response object received from the express.get() method.
 *
 
 * @returns {undefined}                  
 */
function showRegistrationForm(request, response) {
	var action = request.path.split('/').slice(-1)[0];
	console.log(action);
	var isSellerLoggedIn = request.session.seller ? true : false;

	if ((action === 'add') && (!isSellerLoggedIn)) { 		
		var provinces = Object.create(provincesPrototype);
		provinces.country = "South Africa";
		provinces.readObjects(function (err, provinces) {
			if (err) {
				throw err;
			}
			response.render('register', {
				provinces: provinces.objects,
				heading: 'New Seller',
				buttonCaption: 'Register',
				emailError: '',
				sellerType: '',
				email: '',
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
			});
		});
	} else if ((action === 'edit') && (isSellerLoggedIn)) {
		var ss = request.session.seller;
		var provinces = Object.create(provincesPrototype);
		provinces.country = "South Africa";
		provinces.readObjects(function (err, provinces) {
			if (err) {
				throw err;
			}
			response.render('register', {
				provinces: provinces.objects,
				heading: 'Edit Seller',
				buttonCaption: 'Save Changes',
				emailError: '',
				sellerType: ss.type,
				email: ss.email,
				password: ss.password,
				firstname: ss.firstname,
				surname: ss.surname,
				telephone: ss.telephone,
				cellphone: ss.cellphone,
				dealershipName: ss.dealershipName,
				streetAddress1: ss.streetAddress1,
				streetAddress2: ss.streetAddress2,
				province: ss.province,
				town: ss.town,
				townId: ss.townId,
				loggedIn:isSellerLoggedIn 
			});
		});
	}
}

module.exports = {
	show: showProfile,
	add: addProfile,
	edit: editProfile,
	remove: removeProfile,
	showRegistrationForm: showRegistrationForm,
	verifyEmail: verifyEmail,
	setSession: setSession
};
