/*jshint node: true*/

'use strict';

/**
 * @file models/sellers.js
 * Component: users
 * Purpose: Defines the Mongoose model for seller objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Model */
var sellerSchema = mongoose.Schema({
	dealershipName: {
		type: String,
		default: ''
	},
	contactPerson: {
		firstname: {
			type: String,
			required: true
		},
		surname: {
			type: String,
			required: true
		}
	},
	contactNumbers: {
		type: Array,
		required: true,
		validate: [
			function (list) {
				for (var index = 0; index < list.length; index++) {
					if (!/\d{10}/.test(list[index])) {
						return false;
					}
				}
				return true;
			},
			'invalid contact number'
		]
	},
	address: {
		street: {
			type: String,
			default: ''
		},
		suburb: {
			type: String,
			default: ''
		},
		town: {
			type: String,
			required: true,
			validate: /[^(Please select ...)]/
		},
		province: {
			type: String,
			required: true,
			validate: /[^(Please select ...)]/
		},
		country: {
			type: String,
			required: false,
			default: 'South Africa'
		}
	},
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

module.exports = mongoose.model('Seller', sellerSchema);