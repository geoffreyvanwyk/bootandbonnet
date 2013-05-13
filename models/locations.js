"use strict";

/**
 * For working with the locations database table.
 */

var async = require('async'); // For working with asynchronous collection methods.
var db = require('../database.js'); // For connecting to the database.

var town = Object.defineProperties({}, {
	/* Data Properties */
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
	province: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	country: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	/**
	 * Returns a row from the locations database table, in the form of a town object, based on the locations's id.
	 * 
	 * @param	{function}	callback	Another function which is called as soon as this function has completed its 
	 *                                  execution.
	 * 
	 * @return	{function}	Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      location object as the second argument. When there is no error, the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	read: {
		value: function (callback) {
			var that = this;
			db.query('SELECT id, province, town, country FROM locations WHERE id = ?', [
				that.id
			], function (err, rows, fields) {
				if (err) {
					throw err;
				} else if (rows.length === 0) {
					return callback(new Error('Location does not exist.'));
				} else {
					that.name = rows[0].town;
					that.province = rows[0].province;
					that.country = rows[0].country;
					return callback(null, that);
				}
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},

});

Object.preventExtensions(town);

var province = Object.defineProperties({}, {
	/* Data Properties */
	name: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	towns: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	country: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	read: {
		value: function (callback) {
			var that = this;
			var whereCondition = " AND country = ".concat(db.escape(that.country));
			db.query("SELECT id, town FROM locations WHERE province = ?".concat(whereCondition), that.name, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					var twn = Object.create(town);
					twn.id = row.id;
					twn.name = row.town;
					twn.province = that.name;
					twn.country = that.country;
					that.towns.push(twn);
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

Object.preventExtensions(province);


var provinces = Object.defineProperties({}, {
	/* Data Properties */
	names: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	objects: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
	country: {
		value: "", 
		writable: true,
		enumerable: true,
		configurable: false
	},
	/* Methods */
	/**
	 * Returns an array of strings containing the names of the provinces, 
	 * e.g. ['Eastern Cape', 'Western Cape', 'Northern Cape', 'Limpopo']. 
	 * 
	 * @param   {function}  callback	Another function which is called as soon as this function has completed its 
	 *                                  execution.
	 * 
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and an 
	 *                      array of province names as the second argument. When there is no error the first argument is 
	 *                      null. When there is an error, the second argument is undefined.
	 */
	readNames: {
		value: function (callback) {
			var that = this;
			db.query('SELECT DISTINCT province FROM locations WHERE country = ?', that.country, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					that.names.push(row.province);
					callback1();
				}, function () {
					return callback(null, that);
				});
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	},
	/**
	 * Returns an array of province objects. An example of a province object is:
	 * {
	 *   name: 'Eastern Cape',
	 *   towns: [
	 *           {
	 *               name: 'Port Elizabeth',
	 *               id: 1023
	 *           },
	 *           {
	 *               name: 'East London',
	 *               id: 34
	 *           }
	 *          ]
	 *  }
	 *  
	 * @param   {function}  callback	Another function which is called as soon as this function has completed its 
	 *                                  execution.
	 * 
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and an 
	 *                      array of province objects as the second argument. When there is no error the first argument 
	 *                      is null. When there is an error, the second argument is undefined.
	 */
	readObjects: {
		value: function (callback) {
			var that = this;
			that.readNames(function (err, that) {
				if (err) {
					return callback(err);
				}
				async.forEach(that.names, function (provinceName, callback1) {
					var prov = Object.create(province);
					prov.name = provinceName;
					prov.country = that.country;
					prov.towns = [];
					that.objects.push(prov);
					callback1();
				}, function () {
					async.forEach(that.objects, function (provinceObject, callback2) {
						provinceObject.read(function (err, provinceObject) {
							if (err) {
								return callback(err);
							}
							callback2();
						});
					}, function () {
						return callback(null, that);
					});
				});
			});
		},
		writable: false,
		enumerable: false,
		configurable: false
	}
});

Object.preventExtensions(provinces);

module.exports = {
	town: town,
	provinces: provinces
};
