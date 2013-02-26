"use strict";

/**
 * For working with the locations database table.
 */

var async = require('async');             // For working with asynchronous collection methods.
var db = require('../database.js');    // For connecting to the database.

var location = {
	/**
	 * Returns a row from the locations database table, in the form of a location object, based on the locations's id.
	 * 
	 * @param	{number}	id				The id of the location row.
	 * @param   {function}  callback        Another function which is called as soon as this function has completed its 
	 *                                      execution.
	 * 
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      location object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	read: function(id, callback) {
		db.query('SELECT id, province, town FROM locations WHERE id = ?', id, function(err, rows, fields) {
			if (err) {
				throw err;
			} else if (rows.length === 0) {
				return callback(new Error('Location does not exist.'));
			} else {
				var theLocation = {
					id: rows[0].id,
					province: rows[0].province,
					town: rows[0].town
				};
				return callback(null, theLocation);
			}
		});
	}
};

var provinces = {
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
	names: function(callback) {
		db.query('SELECT DISTINCT province FROM locations', function(err, rows, fields) {
			if (err) {
				return callback(err);
			} else {
				var provinceNames = [];
				async.forEach(rows, function(row, callback1) {
					provinceNames.push(row.province);
					callback1();
				}, function() {
					return callback(null, provinceNames);
				});
			}

		});
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
	objects: function(callback) {
		var provinceObjects = [];
		provinces.names(function(err, provinceNames) {
			if (err) {
				return callback(err);
			}
			async.forEach(provinceNames, function(provinceName, callback1) {
				provinceObjects.push({
					name: provinceName,
					towns: []
				});
				callback1();
			}, function() {
				async.forEach(provinceObjects, function(provinceObject, callback2) {
					db.query("SELECT id, town FROM locations WHERE province = ?", provinceObject.name, function(err, rows, fields) {
						if (err) {
							return callback(err);
						}
						async.forEach(rows, function(row, callback3) {
							provinceObject.towns.push({
								id: row.id,
								name: row.town
							});
							callback3();
						}, function() {
							callback2();
						});
					});
				}, function() {
					return callback(null, provinceObjects);
				});
			});
		});
	}
};

module.exports.location = location;
module.exports.provinces = provinces;