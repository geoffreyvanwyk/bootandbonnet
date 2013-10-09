"use strict";

var mongoose = require('mongoose');
var Vehicle = require('./vehicles').Vehicle;

var modelSchema = mongoose.Schema({
	name: String,
	shape: {type: String, default: 'general'},
	photo: {type: String, default: 'unknown' }, // File path to image.
	vehicles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'}]
});

modelSchema.index({name: 1}, {unique: true});

var makeSchema = mongoose.Schema({
	name: String,
	emblem: {type: String, default: 'unknown'}, // File path to image.
	models: [modelSchema]
});

makeSchema.index({name: 1}, {unique: true});

var Make = mongoose.model('Make', makeSchema);

module.exports = {
	Make: Make
};