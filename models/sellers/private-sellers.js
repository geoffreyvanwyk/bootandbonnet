"use strict";

var mongoose = require('mongoose');

var privateSellerSchema = mongoose.Schema({
	name: {
		firstname: String,
		surname: String
	},
	telephone: String,
	cellphone: String,
	address: {
		town: String,
		province: String,
		country: String
	},
	account: {type: mongoose.Schema.Types.ObjectId, ref: 'Seller'}
});

var PrivateSeller = mongoose.model('PrivateSeller', privateSellerSchema);

module.exports = {
	PrivateSeller: PrivateSeller
};