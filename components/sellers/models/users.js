"use strict";

/**
 * For working with the users database table.
 */

var db = require('../../../database'); // For connecting to the database.

var user = Object.defineProperties({}, {
	/* Data properties */
	id: {
		value: 0,
		writable: true,
		enumerable: true,
		configuarable: false
	},
	emailAddress: {
		value: "",
		writable: true,
		enumerable: true,
		configuarable: false
	},
	passwordHash: {
		value: "",
		writable: true,
		enumerable: true,
		configuarable: false
	},
	dateAdded: {
		value: "",
		writable: true,
		enumerable: true,
		configuarable: false
	},
	emailAddressVerified: {
		value: 0,
		writable: true,
		enumerable: true,
		configuarable: false
	},
	/* Methods */
	create: {
		value: function(callback) {
			var that = this;
			db.query('INSERT INTO users SET ?', {
				emailAddress: that.emailAddress,
				passwordHash: that.passwordHash
			}, function(err, result) {
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
		value: function(callback) {
			var that = this;
			db.query('SELECT * FROM users WHERE emailAddress = ?', [
				that.emailAddress
			], function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				if (rows.length === 0) {
					console.log(rows);
					return callback(new Error('The email address has not been registered.'));
				}
				that.id = rows[0].id;
				that.passwordHash = rows[0].passwordHash;
				that.dateAdded = rows[0].dateAdded;
				that.emailAddressVerified = rows[0].emailAddressVerified;
				return callback(null, that);
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	update: {
		value: function(callback) {
			var that = this;
			db.query("UPDATE users SET ? WHERE id = ".concat(db.escape(that.id)), {
				emailAddress: that.emailAddress,
				passwordHash: that.passwordHash,
				emailAddressVerified: that.emailAddressVerified
			}, function(err, result) {
					if (err) {
						return callback(err);
					}
					return callback(null, that);
				}
			);
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	del: {
		value: function(callback) {
			var that = this;
			db.query('DELETE FROM users WHERE id = ?', that.id, function(err) {
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

Object.preventExtensions(user);

module.exports.user = user; 
