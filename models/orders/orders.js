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
		type: mongoose.Schema.Types.Objectid,
		ref: 'Seller',
		required: true
	}
});

var Order = mongoose.model('Order', orderSchema);

module.exports =  {
	Order: Order
};