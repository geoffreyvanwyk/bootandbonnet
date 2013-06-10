"use strict";

var async = require('async');
var db = require('../database');

var photo = Object.defineProperties({}, {
	/* Data properties */
	id: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	filePath: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	vehicleId: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	create: {
		value: function (callback) {
			var that = this;
			db.query("INSERT INTO photos SET ?", {
				filePath: that.filePath,
				vehicleId: that.vehicleId
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				that.id = result.insertId;
				return callback(null, that);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	readByVehicleId: {
		value: function (callback) {
			var that = this;
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	update: {
		value: function (callback) {
			var that = this;
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	del: {
		value: function (callback) {
			var that = this;
		},
		writable: true,
		enumerable: true,
		configurable: false
	},

});

Object.preventExtensions(photo);

var photos = Object.defineProperties({}, {
	all: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	vehicleId: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	readByVehicleId: {
		value: function (callback) {
			var that = this;
			db.query('SELECT * FROM photos WHERE vehicleId = ?', that.vehicleId, function (err, rows, fiels) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					that.all.push({
						id: row.id,
						filePath: row.filePath,
						vehicleId: row.vehicleId
					});	
					callback1();
				}, function () {
					return callback(null, that);	
				});
			}); 
		},
		writable: true,
		enumerable: true,
		configurable: false
	}
});

Object.preventExtensions(photos);

module.exports = {
	photo: photo,
	photos: photos
}; 
