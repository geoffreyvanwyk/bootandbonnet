/*jslint node: true */

'use strict';

/*
 * Component: orders
 *
 * File: models/orders/orders.js
 *
 * Purpose: Defines the Mongoose model for order objects.
 */

var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Seller',
		required: true
	},
	payment: {
		method: {
			type: String,
			required: true
		},
		paid: {
			type: Boolean,
			default: false
		},
		date: {
			type: Date,
			default: Date.now 
		}
	}
});

var Order = mongoose.model('Order', orderSchema);

module.exports =  {
	Order: Order
};
