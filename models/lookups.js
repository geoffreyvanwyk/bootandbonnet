/**
 * Model: Lookups
 * 
 * File Name: lookups.js
 * 
 */

"use strict";

var mongoose = require('mongoose');

var lookupSchema = mongoose.Schema({
	colors: [String],
	fuels: [String],
	transmissions: [String]
});

var Lookups = mongoose.model('Lookups', lookupSchema);

module.exports = {
	Lookups: Lookups
};