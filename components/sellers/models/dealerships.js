"use strict";

/**
 * For working with the dealerships database table.
 */

var db = require('../../../database'); // For connecting to the database.

exports.dealership = {
	/**
	 * Inserts a new row into the dealerships database table, and returns the newly inserted row, in the form of a 
	 * dealership object, as the second argument to a callback function. The first argument to the callback function is 
	 * an error object.
	 * 
	 * @param	{string}	name			The name of the dealership.
	 * @param	{string}	streetAddress1	Part 1 of the dealerships street address.
	 * @param	{string}	streetAddress2	Part 2 of the dealerships street address.
	 * @param	{string}	locationId		The id of the row in the locations database table with which the dealership is 
	 *										associated.
	 * @param	{function}	callback		Another function which is called as soon as this function has completed its 
	 *										execution.
	 *										
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      dealership object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	create: function(name, streetAddress1, streetAddress2, locationId, callback) {
		var theDealership = {
			name: name,
			streetAddress1: streetAddress1,
			streetAddress2: streetAddress2,
			locationId: locationId
		};
		db.query('INSERT INTO dealerships SET ?', theDealership, function(err, result) {
			if (err) {
				return callback(err);
			}
			else {
				theDealership.id = result.insertId;
				callback(null, theDealership);
			}
		});
	},
	/**
	 * Returns a row from the dealerships database table, in the form of a dealership object, based on the id of the  
	 * dealership.
	 * 
	 * @param   {number}    dealershipId	The id of the dealership.
	 * @param   {function}  callback		Another function which is called as soon as this function has completed its 
	 *										execution.
	 * 
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      dealership object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	read: function(dealershipId, callback) {
		db.query('SELECT * FROM dealerships WHERE id = ?', dealershipId, function(err, rows, fields) {
			if (err) {
				return callback(err);
			}
			if (rows.length === 0) {
				return callback(new Error('Dealership does not exist.'));
			}
			var theDealership = {
				id: rows[0].id,
				name: rows[0].name,
				streetAddress1: rows[0].streetAddress1,
				streetAddress2: rows[0].streetAddress2,
				locationId: rows[0].locationId
			};
			return callback(null, theDealership);
		});
	},
	/**
	 * Updates a row in the dealerships database table, and returns that row, in the form of a dealership object, as the 
	 * second argument to a callback function. The first argument to the callback function is an error object.
	 * 
	 * @param	{number}	dealershipId	The id of the row to be updated.
	 * @param	{string}	name			The name of the dealership.
	 * @param	{string}	streetAddress1	Part 1 of the dealerships street address.
	 * @param	{string}	streetAddress2	Part 2 of the dealerships street address.
	 * @param	{string}	locationId		The id of the row in the locations database table with which the dealership is 
	 *										associated.
	 * @param	{function}	callback		Another function which is called as soon as this function has completed its 
	 *										execution.
	 *										
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      dealership object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	update: function(dealershipId, name, streetAddress1, streetAddress2, locationId, callback) {
		var theDealership = {
			name: name,
			streetAddress1: streetAddress1,
			streetAddress2: streetAddress2,
			locationId: locationId
		};
		db.query('UPDATE dealerships SET ? WHERE id = '.concat(dealershipId), theDealership, function(err, result) {
			if (err) {
				return callback(err);
			}
			else {
				theDealership.id = dealershipId;
				callback(null, theDealership);
			}
		});
	}
};