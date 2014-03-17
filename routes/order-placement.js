/*jslint node: true */

'use strict';

/**
 * @file routes/order-placement.js
 * @summary Component: Order Placement. Contains routes for the handling of orders.
 */

/* Import external modules. */
var async = require('async') // For asynchronous iteration.

/* Import models */
,	Order = require('../models/orders')
,	Item = require('../models/items')
,	Vehicle = require('../models/vehicles')

/* Import routes */
,	main = require('./main')

/* Routes */
,	orders = module.exports = {
	/**
	 * @summary Responds to HTTP GET /orders/add.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 * 
	 * @returns {undefined}
	 */
	showCart: function showCart(request, response) {
		response.render('cart-form', {
			items: request.query.items,
			seller: request.session.seller,
			isLoggedIn: true
		});
	},
	/**
	 * @summary Responds to HTTP POST /orders/add.
	 *
	 * @param	{object}	request		An HTTP request object received from the express.post() method.
	 * @param	{object}	response	An HTTP response object received from the express.post() method.
	 * 
	 * @returns	{undefined}
	 */
	checkout: function checkout(request, response) {
		function findVehicle(vehicleId, callback) {
			Vehicle.findById(vehicleId, function cbVehicleFindById(err, vehicle) {
				if (err) {
					return callback(err);
				}
				return callback(null, vehicle);
			});
		}
		
		function saveVehicle(vehicle, item, callback) {
			vehicle.save(function cbVehicleSave(err) {
				if (err) {
					return callback(err);
				}
				return callback(null, item);
			});
		}
		
		function updateVehicle(vehicleId, item, callback) {
			findVehicle(vehicleId, function cbFindVehicle(err, vehicle) {
				if (err) {
					return callback(err);
				}
				vehicle.advertisement.pending = true;
				saveVehicle(vehicle, item, callback);
			});
		}
		
		function createItem(order, cartItem, callback) {
			var orderItem = new Item({
				order: order._id,
				vehicle: cartItem._id,
				weeks: cartItem.weeks,
				cost: cartItem.cost
			});

			orderItem.save(function cbOrderItemSave(err, item) {
				if (err) {
					return callback(err);
				}
				updateVehicle(cartItem._id, item, callback);
			});
		}

		function attachItemsToOrder(order, callback) {
			var cartItem 
			,	cartItemsObject = request.body
			,	cartItems = []
			,	totalCost = 0

			for (cartItem in cartItemsObject) {
				if (cartItemsObject.hasOwnProperty(cartItem)) {
					cartItems.push(cartItemsObject[cartItem]);
					totalCost += Number(cartItemsObject[cartItem].cost);
				}
			}

			async.forEach(cartItems, function createItems(cartItem, callback1) {
				createItem(order, cartItem, function (err, item) {
					if (err) {
						return callback(err);
					}
					callback1();
				});
			}, function cbCreateItems() {
				return callback(null, order, totalCost);
			});
		}

		function createOrder(callback) {
			var order = new Order({
				seller: request.session.seller._id,
				paymentMethod: 'Direct deposit'
			});

			order.save(function cbOrderSave(err, order) {
				if (err) {
					return callback(err);
				}
				attachItemsToOrder(order, callback);
			});
		}

		createOrder(function cbCreateOrder(err, order, totalCost) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				response.redirect(302, '/orders/banking-details?'
					.concat('amountDue=').concat(totalCost)
					.concat('&referenceNumber=').concat(encodeURIComponent(order._id))
				);
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /orders/banking-details. Displays the bank-account-details page.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	showBankDetails: function showBankDetails(request, response) {
		response.render('bank-account-details-page', {
			amountDue: request.query.amountDue,
			referenceNumber: decodeURIComponent(request.query.referenceNumber), 
			seller: request.session.seller,
			isLoggedIn: true
		});
	},
	/**
	 * @summary Responds to HTTP GET /orders/:orderId/pay.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	payOrder: function payOrder(request, response) {
	}
};

/**
 * @summary Handles all the errors in this module.
 *
 * @param {object} err An Error object.
 * @param {object} request An HTTP request object received from the express.post() method.
 * @param {object} response An HTTP response object received from the express.post() method.
 * 
 * @returns {undefined}
 */
function handleErrors(err, request, response) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');
	response.redirect(302, '/error');
}