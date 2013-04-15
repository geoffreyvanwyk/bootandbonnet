"use strict";

/**
 * Handles the register.ejs view.
 */

var provincesPrototype = require('../../../models/locations').provinces;	// For working with the locations database tabe.

var register = exports.register = {
	/**
	 * Displays the register form, to either add or edit a seller profile. If a seller is already logged-in, a new 
	 * profile is not added. If a seller is not logged-in, a profile cannot be edited.
	 * 
	 * @param   {string}    action          Either 'add' or 'edit' depending on whether a new seller is to be registered 
	 *                                      or whether an existing seller's details are to be edited.
	 * @param   {string}    heading         The heading text for the form: either 'New Seller' or 'Edit Seller'.
	 * @param   {string}    method          The HTTP method by which the form should be submitted: either 'post' (to 
	 *                                      create a profile) or 'put' (to edit a profile).
	 * @param   {string}    btnCaption      The text that appears on the form's submit button: either 'Register' or 
	 *                                      'Save changes'.
	 * @param   {string}    emailError      The text to display if the email address entered into the form has already 
	 *                                      been registered.
	 * @param   {string}    sellerType      The seller is either a 'privateSeller' or a 'dealership'.
	 * @param   {string}    email           The email address of the seller.  
	 * @param   {string}    password        The password of the seller.
	 * @param   {string}    firstname       The firstname of the seller.
	 * @param   {string}    surname         The surname of the seller.
	 * @param   {string}    telephone       The telephone number of the seller.
	 * @param   {string}    cellphone       The cellphone number of the seller.
	 * @param   {string}    dealershipName  The name of the dealership with which the seller is associated.
	 * @param   {string}    streetAddress1  The first part of the street address of the dealership.
	 * @param   {string}    streetAddress2  The second part of the street address of the dealership.
	 * @param   {string}    province        The province in which the dealership is located.
	 * @param   {string}    town            The town in which the dealership is located.
	 * @param   {number}    townId          The id of the town in the locations database table.
	 * @param   {bool}      loggedIn        True, if the seller is loggedIn; false, otherwise.
	 * @param   {object}    response        An HTTP response object received from the express.get()method. It is used to 
	 *                                      send the register form to the web browser.
	 * 
	 * @returns {undefined}                  
	 */
	show: function(action, heading, method, btnCaption, emailError, sellerType,
			email, password, firstname, surname, telephone, cellphone,
			dealershipName, streetAddress1, streetAddress2, province, town, townId,
			loggedIn, response) {

		if (((action === 'add') && (!loggedIn)) || ((action === 'edit') && (loggedIn))) {
			var provinces = Object.create(provincesPrototype);
			provinces.country = "South Africa";
			provinces.readObjects(function(err, provinces) {
				if (err) {
					throw err;
				}
				response.render('register', {
					provinces: provinces.objects,
					heading: heading,
					method: method,
					buttonCaption: btnCaption,
					emailError: emailError,
					sellerType: sellerType,
					email: email,
					password: password,
					firstname: firstname,
					surname: surname,
					telephone: telephone,
					cellphone: cellphone,
					dealershipName: dealershipName,
					streetAddress1: streetAddress1,
					streetAddress2: streetAddress2,
					province: province,
					town: town,
					townId: townId,
					loggedIn: loggedIn
				});
			});
		}
	},
	/**
	 * Responds to HTTP GET /seller/add. Displays the register form with all fields blank. 
	 * 
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 * 
	 * @return  {void}
	 */
	add: function(request, response) {
		register.show('add', 'New Seller', 'post', 'Register', '', '',
				'', '', '', '', '', '',
				'', '', '', '', '', '',
				request.session.seller, response);
	},
	/**
	 * Responds to HTTP GET /seller/edit. Displays the register form with the fields prefilled with the logged-in 
	 * seller's details. 
	 * 
	 * @param   {object}    request     An HTTP request object received from the express.get() method.
	 * @param   {object}    response    An HTTP response object received from the express.get() method.
	 * 
	 * @return  {void}
	 */
	edit: function(request, response) {
		var ss = request.session.seller;
		register.show('edit', 'Edit Seller', 'put', 'Save changes', '', ss.type,
				ss.email, '', ss.firstname, ss.surname, ss.telephone, ss.cellphone,
				ss.dealershipName, ss.streetAddress1, ss.streetAddress2, ss.province, ss.town, ss.townId,
				ss.loggedIn, response);
	}
};
