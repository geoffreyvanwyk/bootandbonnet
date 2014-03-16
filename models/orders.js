/*jslint node: true */

'use strict';

/**
 * @file models/orders.js
 * @summary Component: Order Placement. Defines the Mongoose model for order objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Model */
var orderSchema = mongoose.Schema({
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Seller',
		required: true,
	},
	paymentMethod: {
		type: String,
		required: true,
	},
	datePlaced: {
		type: Date,
		default: Date.now,
	},
	datePaid: {
		type: Date,
	},
});

module.exports =  mongoose.model('Order', orderSchema);