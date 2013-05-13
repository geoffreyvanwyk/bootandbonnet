"use strict";

/**
 * For working with the sellers database table.
 */

var db = require('../../../database'); // For connecting to the database.

var seller = Object.defineProperties({}, {
	/* Data properties */
	id: {
		value: 0, 
		writable: true,
		enumerable: true,
		configurable: false
	},
	firstname: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	surname: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	telephone: {
		value: "", 
		writable: true,
		enumerable: true,
		configurable: false
	},
	cellphone: {
		value: "", 
		writable: true,
		enumerable: true,
		configurable: false
	},
	dealershipId: {
		value: 0, 
		writable: true,
		enumerable: true,
		configurable: false
	},
	userId: {
		value: 0, 
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	create: {
		value: function (callback) {
			var that = this;
			db.query('INSERT INTO sellers SET ?', {
				firstname: that.firstname,
				surname: that.surname,
				telephone: that.telephone,
				cellphone: that.cellphone,
				dealershipId: that.dealershipId,
				userId: that.userId
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
			db.query('SELECT * FROM sellers WHERE userId = ?', that.userId, function(err, rows, fields) {
				if (err) {
					return callback(err);
				}
				if (rows.length === 0) {
					return callback(new Error('Seller does not exist.'));
				}
				that.id = rows[0].id;
				that.firstname = rows[0].firstname; 
				that.surname = rows[0].surname; 
				that.telephone = rows[0].telephone;
				that.cellphone = rows[0].cellphone;
				that.dealershipId = rows[0].dealershipId;
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
			db.query('UPDATE sellers SET ? WHERE id = '.concat(db.escape(that.id)), {
				firstname: that.firstname,
				surname: that.surname,
				telephone: that.telephone,
				cellphone: that.cellphone
			}, function(err, result) {
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
		value: function(callback) {
			var that = this;
			db.query('DELETE FROM sellers WHERE id = ?', that.id, function(err) {
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

Object.preventExtensions(seller);

module.exports.seller = seller;
