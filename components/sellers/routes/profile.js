"use strict";

/**
 * Handles the profile.ejs view.
 */

var bcrypt = require('bcrypt');	// For hashing and comparing passwords.
var dealership = require('../models/dealerships').dealership; // For working with the dealerships database table.
var location = require('../../../models/locations').location; // For working with the locations database table.
var register = require('./register').register; // For working withe the register.ejs view.
var sanitize = require('sanitizer').sanitize; // For removing scripts from user input.
var seller = require('../models/sellers').seller; // For working with the sellers database table.
var user = require('../models/users').user; // For working with the users database table.

var profile = exports.profile = {
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
												{id: 1}, profile.show);
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
																		newSeller, newDealership, profile.show);
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
	 * Responds to HTTP PUT /seller/view. Edits the user profile.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {void}		It returns nothing.
	 */
	edit: function (request, response) {
		var slr = request.body.seller;
		var ss = request.session.seller;

		bcrypt.hash(slr.password, 10, function(err, hash) {
			if (err) {
				throw err;
			} else {
				if (slr.password === '') {
					hash = null;
				}
				user.update(ss.userId, slr.email, hash, function(err, theUser) {
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
										profile.createSessionSeller(request, response, theUser, theSeller,
												{id: 1}, profile.show);
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
																profile.createSessionSeller(request, response, newUser,
																		theSeller, theDealership, profile.show);
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
	 * Responds to HTTP GET /seller/view. Displays the seler's profile.
	 *
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 *
	 * @return  {void}		It returns nothing.
	 */
	show: function(request, response) {
			var ss = request.session.seller;
			response.render('profile', {
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
	}
};