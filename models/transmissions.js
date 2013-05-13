"use strict";

/**
  * For working with the transmissions database table.
  */

var async = require('async'); // For working with asynchronous container methods.
var db = require('../database'); // For connecting to the database.

var transmissions = Object.defineProperties({}, {
	/* Data properties */
	types: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	readTypes: {
		value: function (callback) {
			var that = this;
			db.query("SELECT type FROM transmissions", function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					that.types.push(row.type);
					callback1();
				}, function () {
					return callback(null, that);
				});
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	}
});

Object.preventExtensions(transmissions);

module.exports = {
	transmissions: transmissions
};

