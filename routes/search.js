/*jshint node: true*/

'use strict';

/**
 * @file routes/search.js
 * @summary Component: Search. Allows potential buyers to view all advertised vehicles on the web site, and to sort and
 * filter them according to their properties.
 */

/* Import libraries. */
var email = require('../configuration/email').server;

var search = module.exports = {
	/**
	 * @summary Responds to HTTP POST /vehicles/:vehicleId/email-seller. Sends an email message to the seller of the
	 * vehicle on behalf of the potential seller.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	emailSeller: function (request, response) {
		var frmBuyer = request.body.buyer;
		var frmSeller = request.body.seller;
		var frmVehicle = request.body.vehicle;
		var message = {
			from: 'Boot&Bonnet <info@bootandbon.net>',
			to: frmSeller.emailAddress,
			subject: 'Message from Potential Buyer',
			text: 'Dear Sir/Madam, \n\n'
				.concat('A potential buyer has sent you the following message: \n\n')
				.concat('=============================================================').concat('\n\n')
				.concat('Name: ').concat(frmBuyer.name).concat('\n')
				.concat('Email address: ').concat(frmBuyer.emailAddress).concat('\n')
				.concat('Message: ').concat('\n')
				.concat(frmBuyer.message).concat('\n\n')
				.concat('=============================================================').concat('\n\n')
				.concat('Thank you, \n')
				.concat('The Boot&Bonnet Team')
		};
		email.send(message, function (err, message) {
			request.session.isEmailSentToSeller = true;
			response.redirect(302, '/vehicles/'.concat(frmVehicle._id).concat('/view'));
		});
	}
};