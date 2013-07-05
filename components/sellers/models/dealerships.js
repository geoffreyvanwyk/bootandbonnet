"use strict";

var mongoose = require('mongoose');

var dealershipSchema = mongoose.Schema({
	name: String,
	contactPerson: {
		firstname: String,
		surname: String
	},
	telephone: String,
	cellphone: String,
	address: {
		street: String,
		suburb: String,
		town: String,
		province: String,
		country: String
	},
	seller: {type: mongoose.Schema.Types.ObjectId, ref: 'Seller'}
});

var Dealership = mongoose.model('Dealership', dealershipSchema);

module.exports = {
	Dealership: Dealership
};
