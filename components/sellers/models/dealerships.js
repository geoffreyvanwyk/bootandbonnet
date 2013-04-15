"use strict";

/**
 * For working with the dealerships database table.
 */

var db = require('../../../database'); // For connecting to the database.

var dealership = Object.defineProperties({}, {
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
	streetAddress1: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	streetAddress2: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	province: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	town: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	locationId: {
		value: 0, 
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	create: {
		value:	function (callback) {
			var that = this;
			db.query('INSERT INTO dealerships SET ?', {
				name: that.name,
				streetAddress1: that.streetAddress1,
				streetAddress2: that.streetAddress2,
				locationId: that.locationId
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
			db.query('SELECT * FROM dealerships WHERE id = ?', that.id, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				if (rows.length === 0) {
					return callback(new Error('Dealership does not exist.'));
				}
				that.name = rows[0].name;
				that.streetAddress1 = rows[0].streetAddress1;
				that.streetAddress2 = rows[0].streetAddress2;
				that.locationId = rows[0].locationId;
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
			db.query('UPDATE dealerships SET ? WHERE id = '.concat(db.escape(that.id)), {
				name: that.name,
				streetAddress1: that.streetAddress1,
				streetAddress2: that.streetAddress2,
				locationId: that.locationId
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				else {
					callback(null, that);
				}
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	del: {
		value: function (callback) {
			var that = this;
			if (that.id !== 1) {
				db.query('DELETE FROM users WHERE id = ?', that.id, function (err) {
					if (err) {
						return callback(err);
					}
					return callback(null);
				});
			}
			return callback(null);
		},
		writable: false,
		enumerable: false,
		configurable: false
	}
});

Object.preventExtensions(dealership);

module.exports.dealership = dealership;
