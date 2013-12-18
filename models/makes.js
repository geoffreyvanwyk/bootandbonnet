/*jshint node: true*/

'use strict';

/**
 * @file models/makes.js
 * @summary Component: Vehicle Registration. Defines Mongoose model for make objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Import models. */
var Vehicle = require('./vehicles').Vehicle;

/* Models for vehicle models. */
var modelSchema = mongoose.Schema({
	name: {
		type: String
	},
	shape: {
		type: String,
		default: 'general'
	},
	photo: { // File path to image.
		type: String,
		default: 'unknown'
	},
	vehicles: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Vehicle'
	}]
});

modelSchema.index({name: 1}, {unique: true});

/* Make model. */
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