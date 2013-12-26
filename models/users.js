/*jshint node: true*/

'use strict';

/**
 * @file models/users.js
 * @summary Component: Seller Registration. Defines Mongoose model for user objects.
 */

/* Import external modules. */
var bcrypt = require('bcrypt'); // For hashing passwords.
var mongoose = require('mongoose'); // For creating models.

/* Model */
var userSchema = mongoose.Schema({
	emailAddress: {
		type: String,
		trim: true,
		lowercase: true,
		match: [
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
			'invalid email address'
		],
		unique: true,
		required: true
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