"use strict";

var mongoose = require('mongoose');

var sellerSchema = mongoose.Schema({
	emailAddress: String,
	passwordHash: String,
	emailAddressVerified: {type: Boolean, default: false}
});

sellerSchema.index({emailAddress: 1}, {unique: true});

var Seller = mongoose.model('Seller', sellerSchema);
	
module.exports = {
	Seller: Seller 
};
