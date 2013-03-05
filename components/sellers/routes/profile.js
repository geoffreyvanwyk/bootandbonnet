"use strict";
/**
 * Handles the profile.ejs and emailVerified.ejs views.
 */

var bcrypt = require('bcrypt'); // For hashing and comparing passwords.
var dealership = require('../models/dealerships').dealership; // For working with the dealerships database table.
var email = require('../../../email').email; // For sending emails.
var emailVerified = require('./emailVerified');
var home = require('../../../routes/home').index;
var location = require('../../../models/locations').location; // For working with the locations database table.
var register = require('./register').register; // For working withe the register.ejs view.
var sanitize = require('sanitizer').sanitize; // For removing scripts from user input.
var seller = require('../models/sellers').seller; // For working with the sellers database table.
var user = require('../models/users').user; // For working with the users database table.

var profile = module.exports.profile = {
	/**
	 * Responds to HTTP POST /seller/view. Inserts a new user into the users database table, a new dealership into the
	 * dealerships database table (if the seller type is 'dealership'), a new seller into the sellers database table,
	 * creates a seller session object, logs-in the new seller, and displays the seller profile page.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.post() method.
	 * @param   {object}    response    An HTTP response object received from the express.post() method.
	 *
	 * @return  {void}		It returns nothing.
	 */
	add: function(request, response) {
		var slr = request.body.seller;
		bcrypt.hash(slr.password, 10, function(err, hash) {
			if (err) {
				throw err;
			} else {
				user.create(slr.email, hash, function(err, newUser) {
					if (err && err.code === 'ER_DUP_ENTRY') {
						register.show('new', 'New Seller', 'post', 'Register', 'Email address already registered.',
							slr.type, slr.email, '', slr.firstname, slr.surname, slr.telephone, slr.cellphone,
							slr.dealershipName, slr.streetAddress1, slr.streetAddress2, slr.province, slr.town,
							slr.townId, slr.loggedIn, response);
					} else if (err) {
						throw err;
					} else {
						var firstname = sanitize(slr.firstname);
						var surname = sanitize(slr.surname);
						var telephone = sanitize(slr.telephone);
						var cellphone = sanitize(slr.cellphone);
						switch (slr.type) {
							case 'privateSeller':
								seller.create(firstname, surname, telephone, cellphone, 1, newUser.id,
									function(err, newSeller) {
										if (err) {
											throw err;
										} else {
											profile.createSessionSeller(request, response, newUser, newSeller,
												{id: 1}, function(request, response) {
												profile.sendEmail(newUser.username, function() {
													console.log('Just completed sending email.');
													profile.show(request, response);
												});
											});
										}
									}
								);
								break;
							case 'dealership':
								var dealershipName = sanitize(slr.dealershipName);
								var streetAddress1 = sanitize(slr.streetAddress1);
								var streetAddress2 = sanitize(slr.streetAddress2);
								var townId = sanitize(slr.townId);
								dealership.create(dealershipName, streetAddress1, streetAddress2, townId,
									function(err, newDealership) {
										if (err) {
											throw err;
										} else {
											seller.create(firstname, surname, telephone, cellphone,
												newDealership.id, newUser.id,
												function(err, newSeller) {
													if (err) {
														throw err;
													} else {
														newDealership.province = sanitize(slr.province);
														newDealership.town = sanitize(slr.town);
														profile.createSessionSeller(request, response, newUser,
															newSeller, newDealership,
															function(request, response) {
																profile.sendEmail(newUser.username, function() {
																	profile.show(request, response);
																});
															}
														);
													}
												}
											);
										}

									}
								);
								break;
						}
					}
				});
			}
		});
	},
	/**
	 * Creates a seller object as a property of the request.session object.
	 *
	 * @param   {object}    request			An HTTP request object received from the express.get() method.
	 * @param   {object}    response		An HTTP response object received from the express.get() method.
	 * @param	{object}	theUser			A user object.
	 * @param	{object}	theSeller		A seller object.
	 * @param	{object}	theDealership	A dealership object.
	 * @param	{function}	callback		The function which is called as soon as this function completes execution.
	 *
	 * @return  {undefined}	Returns a call to its callback function with the HTTP request object as the first argument,
	 *						and the HTTP response object as the second argument.
	 */
	createSessionSeller: function(request, response, theUser, theSeller, theDealership, callback) {
		request.session.seller = {};
		var ss = request.session.seller;
		ss.sellerId = theSeller.id;
		ss.userId = theUser.id;
		ss.dealershipId = theDealership.id;
		ss.email = theUser.username;
		ss.firstname = theSeller.firstname;
		ss.surname = theSeller.surname;
		ss.telephone = theSeller.telephone;
		ss.cellphone = theSeller.cellphone;
		if (theDealership.id === 1) {
			ss.type = 'privateSeller';
		} else {
			ss.type = 'dealership';
		}
		ss.dealershipName = theDealership.name;
		ss.streetAddress1 = theDealership.streetAddress1;
		ss.streetAddress2 = theDealership.streetAddress2;
		ss.province = theDealership.province;
		ss.town = theDealership.town;
		ss.townId = theDealership.locationId;
		ss.loggedIn = true;
		return callback(request, response);
	},
	/**
	 * Responds to HTTP DELETE /seller/view. Deletes the seller profile and all related rows in the database. Displays
	 * the home page.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {undefined}		It returns nothing.
	 */
	del: function(request, response) {
		var ss = request.session.seller;
		seller.del(ss.sellerId, function(err) {
			if (err) {
				throw err;
			} else {
				user.del(ss.userId, function(err) {
					if (err) {
						throw err;
					} else {
						dealership.del(ss.dealershipId, function(err) {
							if (err) {
								throw err;
							} else {
								request.session.seller = null;
								home(request, response);
							}
						});
					}
				});
			}
		});
	},
	/**
	 * Responds to HTTP PUT /seller/view. Edits the user profile.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {void}		It returns nothing.
	 */
	edit: function(request, response) {
		var slr = request.body.seller;
		var ss = request.session.seller;
		bcrypt.hash(slr.password, 10, function(err, passwordHash) {
			if (err) {
				throw err;
			} else {
				if (slr.password === '') {
					passwordHash = null;
				}
				var isEmailChanged = slr.email.toLowerCase() !== ss.email.toLowerCase();
				var isVerified = !isEmailChanged;
				user.update(ss.userId, slr.email, passwordHash, isVerified, function(err, theUser) {
					if (err && err.code === 'ER_DUP_ENTRY') {
						register.show('new', 'New Seller', 'post', 'Register', 'Email address already registered.',
							slr.type, slr.email, '', slr.firstname, slr.surname, slr.telephone, slr.cellphone,
							slr.dealershipName, slr.streetAddress1, slr.streetAddress2, slr.province, slr.town,
							slr.townId, slr.loggedIn, response);
					} else if (err) {
						throw err;
					} else {
						var firstname = sanitize(slr.firstname);
						var surname = sanitize(slr.surname);
						var telephone = sanitize(slr.telephone);
						var cellphone = sanitize(slr.cellphone);
						switch (slr.type) {
							case 'privateSeller':
								seller.update(ss.sellerId, firstname, surname, telephone, cellphone, 1, theUser.id,
									function(err, theSeller) {
										if (err) {
											throw err;
										} else {
											var theDealership = {id: 1};
											profile.createSessionSeller(request, response, theUser, theSeller,
												theDealership,
												function(request, response) {
													if (isEmailChanged) {
														profile.sendEmail(theUser.username, function() {
															profile.show(request, response);
														});
													} else {
														profile.show(request, response);
													}
												}
											);
										}
									}
								);
								break;
							case 'dealership':
								var dealershipName = sanitize(slr.dealershipName);
								var streetAddress1 = sanitize(slr.streetAddress1);
								var streetAddress2 = sanitize(slr.streetAddress2);
								var townId = sanitize(slr.townId);
								dealership.update(ss.dealershipId, dealershipName, streetAddress1, streetAddress2,
									townId,
									function(err, theDealership) {
										if (err) {
											throw err;
										} else {
											seller.update(ss.sellerId, firstname, surname, telephone, cellphone,
												theDealership.id, theUser.id,
												function(err, newSeller) {
													if (err) {
														throw err;
													} else {
														theDealership.province = sanitize(slr.province);
														theDealership.town = sanitize(slr.town);
														profile.createSessionSeller(request, response, theUser,
															theSeller, theDealership,
															function(request, response) {
																var isEmailChanged = slr.email.lowercase() !== ss.email.lowercase();
																if (isEmailChanged) {
																	profile.sendEmail(theUser.username, function() {
																		profile.show(request, response);
																	});
																} else {
																	profile.show(request, response);
																}
															}
														);
													}
												}
											);
										}

									}
								);
								break;
						}
					}
				});
			}
		});
	},
	/**
	 * Sends an email to a seller to verify the email address provided.
	 *
	 * @param	{string}	emailAddress	The email address provided by the seller.
	 * @param	{function}	callback		The function which is called as soon as this function completes execution.
	 *
	 * @return {void}
	 *
	 */
	sendEmail: function(emailAddress, callback) {
		bcrypt.hash(emailAddress, 10, function(err, hash) {
			if (err) {
				throw err;
			} else {
				var link = 'http://localhost:3000/seller/edit/verify-email/?email='.concat(encodeURIComponent(emailAddress)).concat('&hash=').concat(hash);
				email.send({
					text: "Dear Sir/Madam,\n\n \
Thank you for registering a BootandBonnet account.\n\n \\n\
In order to guarantee receiving important future emails regarding your account, \
you must verify your email address. \
Please click the following link to verify your email address:\n "
						.concat(link).concat('\n\n')
						.concat("\
Thank you,\n \
The BootandBonnet Team"),
					from: "BootandBonnet <info@bootandbon.net>",
					to: emailAddress,
					subject: "Email Verification"
				}, function(err, message) {
					console.log(err || message);
					callback();
				});
			}
		});
	},
	/**
	 * Responds to HTTP GET /seller/view. Displays the seler's profile.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {undfined}	It returns nothing.
	 */
	show: function(request, response) {
		var ss = request.session.seller;
		response.render('profile', {
			method: 'delete',
			sellerType: ss.type,
			email: ss.email,
			fullname: ss.firstname.concat(' ').concat(ss.surname),
			telephone: ss.telephone,
			cellphone: ss.cellphone,
			dealershipName: ss.dealershipName,
			streetAddress1: ss.streetAddress1,
			streetAddress2: ss.streetAddress2,
			province: ss.province,
			town: ss.town,
			townId: ss.townId,
			loggedIn: true
		});
	},
	/**
	 * Responds to HTTP GET /seller. It checks that the email address and the email hash in the query string match. It
	 * then displays the emailVerification.ejs page.
	 *
	 * @param   {object}	request     An HTTP request object received from the express.get() method.
	 * @param   {object}	response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {undefined}	It returns nothing. It displays the emailVerification page.
	 */
	verifyEmail: function(request, response) {
		var email = decodeURIComponent(request.query.email);
		var emailHash = request.query.hash;
		bcrypt.compare(email, emailHash, function(err, isMatch) {
			if (err) {
				throw err;
			} else if (isMatch) {
				user.updateEmailVerification(email, function(err) {
					if (err) {
						throw err;
					} else {
						emailVerified(request, response);
					}
				});
			}
		});
	}
};