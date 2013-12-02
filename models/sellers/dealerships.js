/*jshint node: true*/

'use strict';

/**
 * @file models/sellers/dealerships.js
 * Component: sellers
 * Purpose: Defines the Mongoose model for dealership objects.
 */

/* Import external modules. */
var mongoose = require('mongoose');

/* Model */
var dealershipSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
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
			required: true
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
		ref: 'Seller',
		required: true
	}
});

module.exports = mongoose.model('Dealership', dealershipSchema);
