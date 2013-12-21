/*jshint node: true*/

'use strict';

/**
 * @file models/makes.js
 * @summary Component: Vehicle Registration. 
 * Mongoose Model: Lookup of Vehicle Makes.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Import models. */
var Vehicle = require('./vehicles');

/* Mongoose Model for vehicle models. */
var modelSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	shape: {
		type: String,
		default: 'general'
	},
	photo: { // File path to image.
		type: String,
		default: 'unknown'
	}
});

modelSchema.index({name: 1}, {unique: true});

/* Mongoose Model for vehicle makes. */
var makeSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	emblem: { // File path to image.
		type: String,
		default: 'unknown'
	},
	models: [modelSchema]
});

makeSchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('Make', makeSchema);