/*jshint node: true */

'use strict';

/**
 * @file models/sellers/sellers.js
 * Component: sellers
 * Purpose: Defines Mongoose model for seller objects.
 */

/* Import external modules. */
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

/* Model */
var sellerSchema = mongoose.Schema({
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
				/* It will be invalidated because of the 'required' validator, not because of
				 * 'invalid password' validator.
				 */
				// return this.invalidate('passwordHash', 'invalid password');
				return null;
			}
			return bcrypt.hashSync(value, 10);
		}
	},
	isEmailAddressVerified: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Seller', sellerSchema);
