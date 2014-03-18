/*jshint node: true */
/*jshint laxcomma: true */

'use strict';

/**
 * @file routes/order-placement.js
 * @summary Component: Order Placement. Contains routes for the handling of orders.
 */

/* Import external modules. */
var async = require('async'); // For asynchronous iteration.

/* Import models */
var	Order = require('../models/orders')
,	Item = require('../models/items')
,	Vehicle = require('../models/vehicles');

/* Import routes */
var	main = require('./main');

/* Routes */
var	orders = module.exports = {
	/**
	 * @summary Responds to HTTP GET /orders/place.
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
	 * @summary Responds to HTTP POST /orders/place.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 * 
	 * @returns {undefined}
	 */
	place: function place(request, response) {
		function findVehicle(vehicleId, callback) {
			Vehicle.findById(vehicleId, function cbVehicleFindById(err, vehicle) {
				if (err) {
					return callback(err);
				}
				return callback(null, vehicle);
			});
		}
		
		function saveVehicle(vehicle, callback) {
			vehicle.save(function cbVehicleSave(err) {
				if (err) {
					return callback(err);
				}
				return callback(null);
			});
		}
		
		function updateVehicle(vehicleId, callback) {
			findVehicle(vehicleId, function cbFindVehicle(err, vehicle) {
				if (err) {
					return callback(err);
				}
				vehicle.advertisement.pending = true;
				saveVehicle(vehicle, callback);
			});
		}
		
		function attachItemsToOrder(order, callback) {
			var cartItem 
			,	cartItemsObject = request.body
			,	cartItems = []
			,	totalCost = 0;

			for (cartItem in cartItemsObject) {
				if (cartItemsObject.hasOwnProperty(cartItem)) {
					cartItems.push(cartItemsObject[cartItem]);
					totalCost += Number(cartItemsObject[cartItem].cost);
				}
			}

			async.forEach(cartItems, function createItem(cartItem, callback1) {
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
					updateVehicle(cartItem._id, callback1);
				});
				
			}, function cbCreateItem(err) {
				if (err) {
					return callback(err);
				}
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
					.concat('&referenceNumber=').concat(order._id)
				);
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /orders/:orderId/view. Displays an individual order.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	show: function show(request, response) {
		var orderId = request.params.orderId;
		
		function expandVehicles(order, items, callback) {
			async.forEach(items, function expandVehicle(item, callback1) {
				item.populate('vehicle').exec();
				callback1();
			}, function cbExpandVehicle() {
				return callback(null, order, items);
			});
		}
		
		function findItems(order, callback) {
			Item.find({order: orderId}, function cbItemFind(err, items) {
				if (err) {
					return callback(err);
				}
				expandVehicles(order, items, callback);
			});
		}
		
		function findOrder(callback) {
			Order.findById(orderId, function cbOrderFindById(err, order) {
				if (err) {
					return callback(err);
				}
				findItems(order, callback);
			});
		}
		
		findOrder(function cbFindOrder(err, order, items) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				response.render('order-page', {
					order: order,
					items: items,
					isLoggedIn: true
				});
			}
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
	pay: function pay(request, response) {
	},
	/**
	 * @summary Responds to HTTP GET /sellers/:sellerId/orders. List the orders placed by the logged-in 
	 * seller.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	listSellerOrders: function listSellerOrders(request, response) {
		var seller;
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
			referenceNumber: request.query.referenceNumber, 
			seller: request.session.seller,
			isLoggedIn: true
		});
	},
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