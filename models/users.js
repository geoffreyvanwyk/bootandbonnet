/*jshint node: true*/

'use strict';

/**
 * @file models/users.js
 * @summary Component: Seller Registration. Defines Mongoose model for user objects.
 */

/* Import external modules. */
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

/* Model */
var userSchema = mongoose.Schema({
	emailAddress: {
		type: String,
		required: true,
		unique: true,
		validate: [
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim,
			'invalid email address'
		],
		set: function (value) {
			return value.toLowerCase().trim(); // The unique constraint is case-sensitive.
		}
	},
	passwordHash: {
		type: String,
		required: true,
		set: function (value) {
			if (value.length < 10) {
				return null; // This leaves the passwordHash unset, and triggers the 'required' validator.
			}
			return bcrypt.hashSync(value, 10);
		}
	},
	isEmailAddressVerified: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', userSchema);