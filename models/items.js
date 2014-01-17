/*jslint node: true */

'use strict';

/**
 * @file models/items.js
 * @summary Component: Order Placement. Defines Mongoose model for item objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Model */
var itemSchema = mongoose.Schema({
	order: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
		required: true
	},
	vehicle: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Vehicle',
		required: true
	},
	weeks: {
		type: Number,
		required: true
	},
	cost: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Item', itemSchema);