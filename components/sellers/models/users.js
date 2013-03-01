"use strict";

/**
 * For working with the users database table.
 */

var db = require('../../../database'); // For connecting to the database.

exports.user = {
    /**
     * Inserts a new row into the users database table, and returns that row, in the form of a user object, as the
     * second argument to a callback function. The first argument to the callback function is an error object.
     *
     * @param	{string}	email			The email address of the new user.
     * @param	{string}	passwordHash	The hash of the password of the new user.
     * @param   {function}  callback        Another function which is called as soon as this function has completed its
     *                                      execution.
     *
     * @return {undefined}		Returns arguments to a callback function: an error object as the first argument, and a
     *                      user object as the second argument. When there is no error the first argument is null.
     *                      When there is an error, the second argument is undefined.
     */
    create: function(email, passwordHash, callback) {
	var newUser = {
	    username: email,
	    password: passwordHash
	};
	db.query('INSERT INTO users SET ?', newUser, function(err, result) {
	    if (err) {
		return callback(err);
	    }
	    newUser.id = result.insertId;
	    return callback(null, newUser);
	});
    },
    /**
     * Returns a row from the users database table, in the form of a user object, based on the user's email address.
     *
     * @param	{string}	email			The email address of the user.
     * @param   {function}  callback        Another function which is called as soon as this function has completed its
     *                                      execution.
     *
     * @return {undefined}		Returns arguments to a callback function: an error object as the first argument, and a
     *                      user object as the second argument. When there is no error the first argument is null.
     *                      When there is an error, the second argument is undefined.
     */
    read: function(email, callback) {
	db.query('SELECT * FROM users WHERE username = ?', email, function(err, rows, fields) {
	    if (err) {
		return callback(err);
	    }
	    if (rows.length === 0) {
		return callback(new Error('The email address has not been registered.'));
	    }
	    var theUser = {
		id: rows[0].id,
		username: rows[0].username,
		passwordHash: rows[0].password
	    };
	    return callback(null, theUser);
	});
    },
    /**
     * Updates a row in the users database table, and returns that row, in the form of a user object, as the
     * second argument to a callback function. The first argument to the callback function is an error object.
     *
     * @param	{number}		userId			The id of the row to be updated.
     * @param	{string}		email			The email address of the new user.
     * @param	{string}		passwordHash	The new hash of the password of the user.
     * @param	{boolean}		isVerified		True if the user's email address has been verified; false, otherwise.
     * @param   {function}		callback        Another function which is called as soon as this function has completed its
     *											execution.
     *
     * @return {undefined}		Returns arguments to a callback function: an error object as the first argument, and a
     *                      user object as the second argument. When there is no error the first argument is null.
     *                      When there is an error, the second argument is undefined.
     */
    update: function(userId, email, passwordHash, isVerified, callback) {
	function updateUser(theUser, userId, callback) {
	    db.query('UPDATE users SET ? WHERE id = '.concat(userId), theUser, function(err, result) {
		if (err) {
		    return callback(err);
		}
		theUser.id = userId;
		return callback(null, theUser);
	    });
	}

	if (passwordHash) {
	    var theUser = {
		username: email,
		password: passwordHash,
		verified: isVerified
	    };
	    updateUser(theUser, userId, callback);
	} else {
	    var theUser = {
		username: email,
		verified: isVerfied
	    };
	    updateUser(theUser, userId, callback);
	}
    },
    /**
     * Sets the verification column in the users database table to true.
     *
     * @param {string}			emailAddress	The email address which is verfified.
     * @param {function}		callback		Another function which is called as soon as this function has completed its
     *											execution.
     *
     * @return	{undefined}		Returns arguments to a callback function.
     */
    updateEmailVerification: function(emailAddress, callback) {
	db.query("UPDATE users SET verified=1 WHERE username = '".concat(emailAddress).concat("'"), function(err, result) {
	    if (err) {
		return callback(err);
	    }
	    return callback(null);
	});
    },
    /**
     * Deletes a row from the users database table.
     *
     * @param	{number}		userId			The id of the row.
     * @param	{function}		callback		Another function which is called as soon as this function has completed its
     *											execution.
     *
     * @return {undefined}		Returns an error object to a callback function. When there is no error the error is null.
     */
    del: function(userId, callback) {
	db.query('DELETE FROM users WHERE id = ?', userId, function(err) {
	    if (err) {
		return callback(err);
	    }
	    return callback(null);
	});
    }
};