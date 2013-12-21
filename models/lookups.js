/*jshint node: true*/

'use strict';

/**
 * @file models/lookups.js
 * @summary Component: Vehicle Registration.
 * Mongoose Model: Lookups of Vehicle properties.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Mongoose Model for lookups of vehicle properties. */
var lookupSchema = mongoose.Schema({
	colors: [{
		type: String,
		required: true
	}],
	fuels: [{
		type: String,
		required: true
	}],
	transmissions: [{
		type: String,
		required: true
	}]
});

module.exports = mongoose.model('Lookups', lookupSchema);