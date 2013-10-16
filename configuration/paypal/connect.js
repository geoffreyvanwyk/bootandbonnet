/*jslint node: true*/

'use strict';

/*
 * Component: orders
 *
 * File: configuration/paypal/connect.js
 *
 * Purpose: Connects to PayPal to receive online payments, using settings in configuration/paypal/settings.json.
 */

/* Import external modules. */
var paypal = require('paypal-rest-sdk');

/* Import built-in modules. */
var fs = require('fs');
var path = require('path');

/** 
 * Read the settings from the settings file. 
 *
 * @returns {undefined}
 */
function connect() {
	var settings;

	fs.readFile(path.join('configuration', 'paypal', 'settings.json'), function (err, settingsJSON) {
		if (err) {
			console.log('ERROR: PayPal settings file could not be found or is invalid.'.concat(err));
			process.exit(1);
		} else {
			settings = JSON.parse(settingsJSON.toString());
			paypal.configure(settings.api);
		}
	});
}

module.exports = {
	connect: connect
};
