"use strict";

var async = require('async');
var db = require('../../../database');
var manufacturerPrototype = require('./manufacturers').manufacturer;

var model = Object.defineProperties({}, {
	/* Data properties */
	id: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	name: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	picture: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	shape: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	manufacturer: {
		value: {},
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	create: {
		value: function (callback) {
			var that = this;	
			db.query("INSERT INTO models SET ?", {
				name: that.name,
				picture: that.emblem,
				shape: that.shape,
				manufacturerId: that.manufacturer.id
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				that.id = result.insertId;
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	}, 
	read: { 
		value: function (callback) { 
			var that = this;	
			that.readModel(function (err, model) {
				if (err) {
					return callback(err);
				}
				that.readManufacturer(function (err, model) {
					if (err) {
						return callback(err);
					}
					return callback(null, that);
				});
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	readModel: { 
		value: function (callback) { 
			var that = this;	
			db.query("SELECT * FROM models WHERE id = ?", that.id, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				that.name = rows[0].name;
				that.picture = rows[0].picture;
				that.shape = rows[0].shape;
				that.manufacturer.id = rows[0].manufacturerId;
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	readByManufacturerId: { 
		value: function (callback) { 
			var that = this;	
			db.query("SELECT * FROM models WHERE manufacturerId = ?", that.manufacturerId, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				that.id = rows[0].id; 
				that.name = rows[0].name;
				that.picture = rows[0].picture;
				that.shape = rows[0].shape;
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	readManufacturer: { 
		value: function (callback) { 
			var that = this;	
			var manufacturer = Object.create(manufacturerPrototype);
			manufacturer.id = that.manufacturer.id;
			manufacturer.read(function (err, manufacturer) {
				if (err) {
					return callback(err);
				}
				that.manufacturer = manufacturer;
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	update: {
		value: function (callback) {
			var that = this;	
			db.query("UPDATE models SET ? WHERE id = ".concat(db.escape(that.id)), {
				name: that.name,
				picture: that.emblem,
				shape: that.shape,
				manufacturerId: that.manufacturerId
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	del: {
		value: function (callback) {
			var that = this;	
			db.query("DELETE FROM models WHERE id = ?", that.id, function (err, result) {
				if (err) {
					return callback(err);
				}
				return callback(null);				
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	}
}); 

Object.preventExtensions(model);

module.exports = {
	model: model
};
