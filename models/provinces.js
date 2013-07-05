"use strict";

var mongoose = require('mongoose');

var provinceSchema = mongoose.Schema({
	name: {
		type: String, 
		required: true, 
		unique: true
	},
	towns: {
		type: [String], 
		required: true
	}
});

var Province = mongoose.model('Province', provinceSchema);

module.exports = {
	Province: Province
};