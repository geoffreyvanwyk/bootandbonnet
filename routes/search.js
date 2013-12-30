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
		console.log('hello world');
	}
};