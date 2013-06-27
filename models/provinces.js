"use strict";

var mongoose = require('mongoose');

var provinceSchema = mongoose.Schema({
	name: String,
	towns: Array
});

provinceSchema.index({name: 1}, {unique: true});

var Province = mongoose.model('Province', provinceSchema);

module.exports = {
	Province: Province
};