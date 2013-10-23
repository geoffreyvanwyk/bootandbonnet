/*jslint node: true */

'use strict';

/*
 * Component: orders
 *
 * File: models/orders/items.js
 *
 * Purpose: Defines Mongoose model for item objects.
 */

var mongoose = require('mongoose');

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

var Item = mongoose.model('Item', itemSchema);

module.exports = {
	Item: Item
};


