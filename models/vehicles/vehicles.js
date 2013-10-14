/*jslint node: true */

'use strict';

/*
 * Component: vehicles
 *
 * File: models/vehicles/vehicles.js
 *
 * Purpose: Defines Mongoose model for vehicle objects.
 */

var mongoose = require('mongoose');

var vehicleSchema = mongoose.Schema({
	market: {type: String, required: true}, // new or used
	type: {
		make: {type: String, required: true},
		model: {type: String, required: true},
		year: {type: Number, min: 1886,	required: true}
	},
	description: {
		mileage: {type: Number, min: 0,	required: true},
		color: {type: String, required: true},
		fullServiceHistory: {type: Boolean,	default: false}
	},
	mechanics: {
		engineCapacity: {type: Number, min: 0, required: true},
		fuel: {type: String, required: true},
		transmission: {type: String, required: true},
		absBrakes: {type: Boolean, default: false},
		powerSteering: {type: Boolean, default: false}
	},
	luxuries: {
		electricWindows: {type: String, default: 'None'},
		airConditioning: {type: Boolean, default: false},
		cdPlayer: {type: Boolean, default: false},
		radio: {type: Boolean, default: false}
	},
	security: {
		alarm: {type: Boolean, default: false},
		centralLocking: {type: Boolean, default: false},
		immobilizer: {type: Boolean, default: false},
		gearLock: {type: Boolean, default: false}
	},
	safety: {
		airBags: {type: Number, min: 0,	default: 0}
	},
	photos: {type: [String], /* File paths to the photos*/ default: []},
	price: {
		value: {type: Number, min: 0, required: true},
		negotiable: {type: Boolean,	default: false}
	},
	comments: {type: String, default: ''},
	expiryDate: { // Date on which advertisement of this vehicle expires.
		type: Date,
		default: Date.now
	},
	seller: {type: mongoose.Schema.Types.ObjectId, ref: 'Seller'}
});

var Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = {
	Vehicle: Vehicle
};