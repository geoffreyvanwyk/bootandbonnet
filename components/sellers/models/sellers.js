"use strict";

/**
 * For working with the sellers database table.
 */

var db = require('../../../database'); // For connecting to the database.

exports.seller = {
	/**
	 * Inserts a new row into the sellers database table, and returns the newly inserted row, in the form of a seller 
	 * object, as the second argument to a callback function. The first argument to the callback function is an error
	 * object.
	 * 
	 * @param   {string}    firstname       The firstname of the seller.
	 * @param   {string}    surname         The surname of the seller.
	 * @param   {string}    telephone       The telephone number (land line) of the seller.
	 * @param   {string}    cellphone       The cellphone number of the seller.
	 * @param   {number}    dealershipId    The id of the dealership in the dealerships database table with which the 
	 *                                      seller is associated.
	 * @param   {number}    userId          The id of the user in the users database table with which the seller is 
	 *                                      associated.
	 * @param   {function}  callback        Another function which is called as soon as this function has completed its 
	 *                                      execution.
	 * 
	 * @return	{void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      seller object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	create: function(firstname, surname, telephone, cellphone, dealershipId, userId, callback) {
		var newSeller = {
			firstname: firstname,
			surname: surname,
			telephone: telephone,
			cellphone: cellphone,
			dealershipId: dealershipId,
			userId: userId
		};
		db.query('INSERT INTO sellers SET ?', newSeller, function(err, result) {
			if (err) {
				return callback(err);
			}
			newSeller.id = result.insertId;
			return callback(null, newSeller);
		});
	},
	/**
	 * Returns a row from the sellers database table, in the form of a seller object, based on the id of the user 
	 * in the users database table, with which the seller is associated.
	 * 
	 * @param   {number}    userId      The id of the user in the users database table, with which the seller is 
	 *                                  associated.
	 * @param   {function}  callback    Another function which is called as soon as this function has completed its 
	 *                                  execution.
	 * 
	 * @return	{void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      seller object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	read: function(userId, callback) {
		db.query('SELECT * FROM sellers WHERE userId = ?', userId, function(err, rows, fields) {
			if (err) {
				return callback(err);
			}
			if (rows.length === 0) {
				return callback(new Error('Seller does not exist.'));
			}
			var theSeller = {
				sellerId: rows[0].id,
				firstname: rows[0].firstname,
				surname: rows[0].surname,
				telephone: rows[0].telephone,
				cellphone: rows[0].cellphone,
				dealershipId: rows[0].dealershipId,
				userId: rows[0].userId
			};
			return callback(null, theSeller);
		});
	},
	/**
	 * Updates a row in the sellers database table.
	 * 
	 * @param	{number}	sellerId		The id of the row to be updated.
	 * @param   {string}    firstname       The firstname of the seller.
	 * @param   {string}    surname         The surname of the seller.
	 * @param   {string}    telephone       The telephone number (land line) of the seller.
	 * @param   {string}    cellphone       The cellphone number of the seller.
	 * @param   {number}    dealershipId    The id of the dealership in the dealerships database table with which the 
	 *                                      seller is associated.
	 * @param   {number}    userId          The id of the user in the users database table with which the seller is 
	 *                                      associated.
	 * @param   {function}  callback        Another function which is called as soon as this function has completed its 
	 *                                      execution.
	 * 
	 * @return {void}		Returns arguments to a callback function: an error object as the first argument, and a 
	 *                      seller object as the second argument. When there is no error the first argument is null. 
	 *                      When there is an error, the second argument is undefined.
	 */
	update: function(sellerId, firstname, surname, telephone, cellphone, dealershipId, userId, callback) {
		var theSeller = {
			firstname: firstname,
			surname: surname,
			telephone: telephone,
			cellphone: cellphone,
			dealershipId: dealershipId,
			userId: userId
		};
		db.query('UPDATE sellers SET ? WHERE id = '.concat(sellerId), theSeller, function(err, result) {
			if (err) {
				return callback(err);
			} else {
				theSeller.id = sellerId;
				return callback(null, theSeller);
			}
		});
	}
};