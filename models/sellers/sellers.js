/*jslint node: true */

'use strict';

/*
 * Component: sellers
 *
 * File: models/sellers/sellers.js
 *
 * Purpose: Defines Mongoose model for seller objects.
 */

var mongoose = require('mongoose');

var sellerSchema = mongoose.Schema({
	emailAddress: {
		type: String,
		unique: true,
		required: true},
	passwordHash: {
		type: String,
		required: true},
	emailAddressVerified: {
		type: Boolean,
		default: false},
	vehicles: {
		type: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Vehicle'
		}],
		default: []
	}
});

var Seller = mongoose.model('Seller', sellerSchema);

module.exports = {
	Seller: Seller
};
