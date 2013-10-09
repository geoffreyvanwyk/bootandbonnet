"use strict";

var mongoose = require('mongoose');

var sellerSchema = mongoose.Schema({
	emailAddress: {type: String, unique: true, required: true},
	passwordHash: {type: String, required: true},
	emailAddressVerified: {type: Boolean, default: false},
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
