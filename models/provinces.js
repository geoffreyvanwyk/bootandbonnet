/*jshint node: true*/

'use strict';

/**
 * @file models/provinces.js
 * Component: main
 * Purpose: Defines the Mongoose model for province objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Model */
var provinceSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	towns: {
		type: [String],
		required: true
	}
});

module.exports = mongoose.model('Province', provinceSchema);