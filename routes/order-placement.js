'use strict'

/**
 * @file routes/order-placement.js
 * @summary Component: Order Placement. Contains routes for the handling of orders.
 */

/* Import external modules. */
var async = require('async') // For asynchronous iteration.

/* Import models */
var	Order = require('../models/orders')
,	Item = require('../models/items')
,	Vehicle = require('../models/vehicles')

/* Import routes */
var	main = require('./main')

/* Routes */
module.exports = {
	/**
	 * @summary Responds to HTTP GET /orders/place. Displays the cart for the logged-in seller.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 * 
	 * @returns {undefined}
	 */
	showCart: function (request, response) {
		response.render('cart-form', {
			items: request.query.items,
			seller: request.session.seller,
			isLoggedIn: true
		})
	},
	/**
	 * @summary Responds to HTTP POST /orders/place. Creates an order document in the orders database 
	 * collection; then displays the banking details to use for paying the order.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 * 
	 * @returns {undefined}
	 */
	place: function (request, response) {
		function saveVehicle(vehicle, callback) {
			vehicle.save(function cbVehicleSave(err) {
				if (err) {
					return callback(err)
				}
				return callback(null)
			})
		}
		
		function findVehicle(vehicleId, callback) {
			Vehicle.findById(vehicleId, function cbVehicleFindById(err, vehicle) {
				if (err) {
					return callback(err)
				}
				return callback(null, vehicle)
			})
		}
		
		function updateVehicle(vehicleId, callback) {
			findVehicle(vehicleId, function cbFindVehicle(err, vehicle) {
				if (err) {
					return callback(err)
				}
				vehicle.advertisement.pending = true
				saveVehicle(vehicle, callback)
			})
		}
		
		function attachItemsToOrder(order, callback) {
			var	cartItem
			,	cartItems = []
			,	cartItemsObject = request.body
			,	totalCost = 0

			for (cartItem in cartItemsObject) {
				if (cartItemsObject.hasOwnProperty(cartItem)) {
					cartItems.push(cartItemsObject[cartItem])
					totalCost += Number(cartItemsObject[cartItem].cost)
				}
			}

			async.forEach(cartItems, function createItem(cartItem, cbCreateItem) {
				var orderItem = new Item({
					order: order._id,
					vehicle: cartItem._id,
					weeks: cartItem.weeks,
					cost: cartItem.cost
				})

				orderItem.save(function cbOrderItemSave(err, item) {
					if (err) {
						return callback(err)
					}
					updateVehicle(cartItem._id, cbCreateItem)
				})
				
			}, function cbCreateItem(err) {
				if (err) {
					return callback(err)
				}
				return callback(null, order, totalCost)
			})
		}
		
		function createOrder(callback) {
			var order = new Order({
				seller: request.session.seller._id,
				paymentMethod: 'Direct deposit'
			})

			order.save(function cbOrderSave(err, order) {
				if (err) {
					return callback(err)
				}
				attachItemsToOrder(order, callback)
			})
		}
		
		createOrder(function cbCreateOrder(err, order, totalCost) {
			if (err) {
				console.log('==================== BEGIN ERROR MESSAGE ====================')
				console.log(err)
				console.log('==================== END ERROR MESSAGE ======================')
				response.redirect(302, '/error')
			} else {
				response.redirect(302, '/orders/banking-details?'
					.concat('amountDue=').concat(totalCost)
					.concat('&referenceNumber=').concat(order._id)
				)
			}
		})
	},
	/**
	 * @summary Responds to HTTP GET /orders/:orderId/view. Displays an individual order.
	 *
	 * @param {object} request An HTTP request object received from the express.post() method.
	 * @param {object} response An HTTP response object received from the express.post() method.
	 *
	 * @returns {undefined}
	 */
	show: function (request, response) {
		var orderId = request.params.orderId
		,	isLoggedIn = !!request.session.seller
		
		function handleErrors(err) {
			console.log('==================== BEGIN ERROR MESSAGE ====================')
			console.log(err)
			console.log('==================== END ERROR MESSAGE ======================')
			
			if (err.message.search('Description:') === 0) {
				request.session.specialError = err.message
			}
			
			response.redirect(302, '/error')
		}
		
		function expandVehicles(order, items, callback) {
			async.forEach(items, function expandVehicle(item, callback1) {
				item.populate('vehicle').exec()
				callback1()
			}, function cbExpandVehicle() {
				return callback(null, order, items)
			})
		}
		
		function findItems(order, callback) {
			Item.find({order: order._id}, function cbItemFind(err, items) {
				if (err) {
					return callback(err)
				}
				if (!items) {
					return callback(new Error('Description: This order does not contain any items.'))
				}
				expandVehicles(order, items, callback)
			})
		}
		
		function checkOwnership(order, callback) {
			var ssnSeller = request.session.seller
			,	isOwnOrder = order.seller === ssnSeller._id
			
			if (isOwnOrder) {
				findItems(order, callback)
			} else {
				return callback(new Error('Description: You can only view your own orders.'))
			}
		}
		
		function findOrder(orderId, callback) {
			Order.findById(orderId, function cbOrderFindById(err, order) {
				if (err) {
					return callback(err)
				}
				if (!order) {
					return callback(new Error('Description: An order with that id does not exist.'))
				}
				checkOwnership(order, callback)
			})
		}
	
		if (isLoggedIn) {
			findOrder(orderId, function cbFindOrder(err, order, items) {
				if (err) {
					handleErrors(err)
				} else {
					response.render('order-page', {
						order: order,
						items: items,
						isLoggedIn: isLoggedIn
					})
				}
			})
		} else {
			handleErrors(new Error('Description: You must be logged-in to view your orders.'))
		}
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
	listSellerOrders: function (request, response) {
		var	isLoggedIn = !!request.session.seller
		,	sellerId = request.params.sellerId
		
		function handleErrors(err, request, response) {
			console.log('==================== BEGIN ERROR MESSAGE ====================')
			console.log(err)
			console.log('==================== END ERROR MESSAGE ======================')
			
			if (err.message.search(/^Description/) === 0) {
				request.session.specialError = err.message
			}
			
			response.redirect(302, '/error')
		}
		
		function getTotalCost(order, items, callback) {
			order.cost = 0
			async.forEach(items, function addItemCosts(item, cbAddItemCosts) {
				order.cost += item.cost
				
				console.log('==================== BEGIN DEBUG MESSAGE ====================')
				console.log(item)
				console.log('==================== END DEBUG MESSAGE ======================')
				
				cbAddItemCosts()
			}, function cbAddItemCosts() {
				return callback()
			})
		}
		
		function findItems(orders, callback) {
			async.forEach(orders, function getItems(order, cbGetItems) {
				Item.find({order: order._id}, function cbItemFind(err, items) {
					getTotalCost(order, items, cbGetItems)
				})
			}, function cbGetItems() {
				return callback(null, orders)
			})
		}
		
		function findOrders(sellerId, callback) {
			Order.find({seller: sellerId}, function cbOrdersFind(err, orders) {
				if (err) {
					return callback(err)
				}
				findItems(orders, callback)
			})
		}
		
		if (isLoggedIn) {
			findOrders(sellerId, function cbFindOrders(err, orders) {
				if (err) {
					handleErrors(err, request, response)
				} else {
					console.log('==================== BEGIN DEBUG MESSAGE ====================')
					console.log(orders)
					console.log('==================== END DEBUG MESSAGE ======================')
					
					response.render('seller-orders-list', {
						seller: request.session.seller,
						orders: orders,
						isLoggedIn: isLoggedIn
					})
				}
			})
		} else {
			handleErrors(
				new Error('Description: You must be logged-in to view your orders.'), 
				request, 
				response
			)
		}
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
		})
	},
}

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
	console.log('==================== BEGIN ERROR MESSAGE ====================')
	console.log(err)
	console.log('==================== END ERROR MESSAGE ======================')
	response.redirect(302, '/error')
}