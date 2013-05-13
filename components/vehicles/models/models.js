"use strict";

var async = require('async');
var db = require('../../../database');

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
	manufacturerId: {
		value: 0,
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
				manufacturerId: that.manufacturerId
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
	readById: { 
		value: function (callback) { 
			var that = this;	
			db.query("SELECT * FROM models WHERE id = ?", that.id, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				that.name = rows[0].name;
				that.picture = rows[0].picture;
				that.shape = rows[0].shape;
				that.manufacturerId = rows[0].manufacturerId;
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
