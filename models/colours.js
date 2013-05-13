"use strict";

/**
  * For working with the colours database table.
  */

var async = require('async'); // For working with asynchronous container methods.
var db = require("../database"); // For connecting to the database;

var colours = Object.defineProperties({}, {
	names: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	readNames: {
		value: function (callback) {
			var that = this;
			db.query("SELECT name FROM colours", function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					that.names.push(row.name);
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

Object.preventExtensions(colours);

module.exports = {
	colours: colours
};
