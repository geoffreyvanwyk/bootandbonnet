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
	if (request.session.privateSeller) {
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
	mongoose.connection.on('error', console.error.bind(console, 
											'Error: addProfile failed to connect to MongoDB.'));
	mongoose.connection.once('open', function () {
		bcrypt.hash(request.body.user.password, 10, function(err, hash) {
			if (err) {
				throw err;
			}
			var user = new User({
				emailAddress: request.body.user.emailAddress,
				passwordHash: hash
			});
			user.save(function (err, user) {
				if (err) {
					throw err;
				}
				if (slr.type === 'privateSeller') {
					var privateSeller = new PrivateSeller({
						name: {
							firstname: slr.firstname,
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
						mongoose.connection.close();
						var dealership = null;
						setSession(request, response, user, dealership, privateSeller, function () {
							showProfile(request, response, sendEmail);
						});
					});	
				} else {
					var dealership = new Dealership({
						name: slr.dealershipName,
						contactPerson: {
							firstname: slr.firstname,
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
						mongoose.connection.close();
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
 * Responds to HTTP POST /seller/edit. Edits the user profile, then displays it.
 *
 * @param   {object}    request     An HTTP request object received from the express.put() method.
 * @param   {object}    response    An HTTP response object received from the express.put() method.
 *
 * @return  {undefined}
 */
function editProfile(request, response) {
	var isEmailChanged = request.body.user.emailAddress.toLowerCase() !== request.session.user.emailAddress.toLowerCase();
	var isPasswordChanged = request.body.user.password !== "";

	function updateUser(callback) {
		if (isEmailChanged && isPasswordChanged) {
			bcrypt.hash(request.body.user.password, 10, function (err, hash) {
				if (err) {
					throw err;
				} else {
					User.findByIdAndUpdate(request.session.user._id, {
						$set: {
							emailAddress: request.body.user.emailAddress, 
							passwordHash: hash,
							emailAddressVerified: false
						}
					}, function (err, user) {
						if (err) {
							return callback(err);
						} 
						request.session.user.emailAddres = user.emailAddress;
						request.session.user.passworsHash = user.passwordHash;
						return callback(null, user);	
					});
				}
			});		
		} else if (isEmailChanged) {
			User.findByIdAndUpdate(request.session.user._id, {
				$set: {
					emailAddress: request.body.user.emailAddress
				}
			}, function (err, user) {
				if (err) {
					return callback(err);
				}
				request.session.user.emailAddress = user.emailAddress;
				return callback(null, user);
			});
		} else {
			return callback(null, request.session.user);
		}
	}

	mongoose.connect('mongodb://localhost/bootandbonnet');
	mongoose.connection.on('error', console.error.bind(console, 
											'Error: addProfile failed to connect to MongoDB.'));
	mongoose.connection.once('open', function () {
		updateUser(function (err, user) {
			if (err) {
				throw err;
			} else if (request.body.seller.type === 'privateSeller' && request.session.privateSeller) {
				PrivateSeller.findByIdAndUpdate(request.session.privateSeller._id, {
					$set: {
						name: {
							firstname: request.body.seller.firstname,
							surname: request.body.seller.surname
						},
						telephone: request.body.seller.telephone,
						cellphone: request.body.seller.cellphone,
						address: {
							town: request.body.seller.town,
							province: request.body.seller.province
						}	
					}
				}, function (err, privateSeller) {
					if (err) {
						throw err;
					} else {
						mongoose.connection.close();
						request.session.privateSeller.name = privateSeller.name;
						request.session.privateSeller.telephone = privateSeller.telephone;
						request.session.privateSeller.cellphone = privateSeller.cellphone;
						request.session.privateSeller.address = privateSeller.address;
						showProfile(request, response, function (request, response) {
							if (isEmailChanged) {
								sendEmail(request, response);
							}
						});
					}
				});
			}
		});
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
	var user = request.session.user;
	var privateSeller = request.session.privateSeller; 
	var dealership = request.session.dealership;

	mongoose.connect('mongodb://localhost/bootandbonnet');
	mongoose.connection.on('error', console.error.bind(console, 
											'Error: addProfile failed to connect to MongoDB.'));
	mongoose.connection.once('open', function () {
		if (privateSeller) {
			PrivateSeller.findByIdAndRemove(privateSeller._id, function (err) {
				if (err) {
					throw err;	
				} else {
					request.session.privateSeller = null;
					User.findByIdAndRemove(user._id, function (err) {
						if (err) {
							throw err;
						} else {
							mongoose.connection.close();
							request.session.user = null;
							home(request, response);				
						}
					});
				}
			});
		} else if (dealership) {
			Dealership.findByIdAndRemove(dealership._id, function (err) {
				if (err) {
					throw err;
				} else {
					request.session.dealership = null;
					User.findByIdAndRemove(user._id, function (err) {
						if (err) {
							throw err;
						} else {
							mongoose.connection.close();
							request.session.user = null;
							home(request, response);					
						}

					});			
				}
			});
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
		_id: user._id,
		emailAddress: user.emailAddress,
		passwordHash: user.passwordHash,
		dateAdded: user.dateAdded,
		emailAddressVerified: user.emailAddressVerified,
		loggedIn: true
	};
	if (dealership === null) {
		request.session.privateSeller = {
			_id: privateSeller._id,
			name: privateSeller.name, 
			telephone: privateSeller.telephone,
			cellphone: privateSeller.cellphone,
			address: privateSeller.address,
			userId: privateSeller.userId
		};
		request.session.dealership = null;
	} else {
		request.session.dealership = {
			_id: dealership._id,
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
			var link = 'http://localhost:3000/seller/edit/verify-email/?emailAddress='
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
	var emailAddress = decodeURIComponent(request.query.emailAddress);
	var emailAddressHash = request.query.hash;
	console.log('Hi!');
	bcrypt.compare(emailAddress, emailAddressHash, function(err, isMatch) {
		if (err) {
			throw err;
		} else if (isMatch) {
			var isUserLoggedIn = request.session.user && request.session.user.loggedIn;
			mongoose.connect('mongodb://localhost/bootandbonnet');
			mongoose.connection.on('error', console.error.bind(console, 
											'Error: addProfile failed to connect to MongoDB.'));
			mongoose.connection.once('open', function () {
				User.findOneAndUpdate({emailAddress: emailAddress}, {
					$set: {
						emailAddressVerified: true
					}
				}, function () {
					if (isUserLoggedIn) {
						request.session.user.emailAddressVerified = true;
					}
					mongoose.connection.close();
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
	var isSellerLoggedIn = request.session.user ? true : false;

	if ((action === 'add') && (!isSellerLoggedIn)) { 		
		var provinces = Object.create(provincesPrototype);
		provinces.country = "South Africa";
		provinces.readObjects(function (err, provinces) {
			if (err) {
				throw err;
			}
			response.render('register', {
				provinces: provinces.objects,
				action: '/seller/add',
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
		var provinces = Object.create(provincesPrototype);
		provinces.country = "South Africa";
		provinces.readObjects(function (err, provinces) {
			if (err) {
				throw err;
			}
			response.render('register', {
				provinces: provinces.objects,
				action: '/seller/edit',
				heading: 'Edit Seller',
				buttonCaption: 'Save Changes',
				emailError: '',
				sellerType: request.session.privateSeller ? 'privateSeller' : 'dealership',
				email: request.session.user.emailAddress,
				password: '',
				firstname: firstname,
				surname: surname,
				telephone: seller.telephone,
				cellphone: seller.cellphone,
				dealershipName: dealershipName,
				streetAddress1: streetAddress1,
				streetAddress2: streetAddress2,
				province: seller.province,
				town: seller.town,
				loggedIn: isSellerLoggedIn 
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
