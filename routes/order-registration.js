/*jslint node: true */

'use strict';

/*
 * Component: orders
 *
 * File: routes/orders/registration.js
 *
 * Purpose: Contains routes for the handling of orders.
 */

/* Import external modules. */
var async = require('async'); // For asynchronous iteration.

/* Import models */
var Order = require('../../models/orders/orders').Order;
var Item = require('../../models/orders/items').Item;

/* Import routes */
var main = require('../../routes/main');

/**
 * Responds to HTTP GET /orders/add.
 *
 * @param	{object}	request		An HTTP request object received from the express.get() method.
 * @param	{object}	response	An HTTP response object received from the express.get() method.
 * @returns	{undefined}
 */
function showCart(request, response) {
	var items;
	items = request.query.items;
	response.render('orders/cart-form', {
		loggedIn: true,
		items: items
	});
}

/**
 * Responds to HTTP POST /orders/add.
 *
 * @param	{object}	request		An HTTP request object received from the express.post() method.
 * @param	{object}	response	An HTTP response object received from the express.post() method.
 * @returns	{undefined}
 */
function checkout(request, response) {
// TODO If a cart is checked out, and it contains items which already appear in an unpaid order, the seller
// should be asked if he wants to update the existing order.

	function createItem(order, cartItem, callback) {
		var orderItem = new Item({
			order: order._id,
			vehicle: cartItem._id,
			weeks: cartItem.weeks,
			cost: cartItem.cost
		});

		orderItem.save(function (err, item) {
			if (err) {
				return callback(err);
			}
			return callback(null, item);
		});
	}
			
	function attachItemsToOrder(order, callback) {
		var cartItem, cartItems, cartItemsObject, totalCost;

		cartItemsObject = request.body;
		cartItems = [];	
		totalCost = 0;

		for (cartItem in cartItemsObject) {
			if (cartItemsObject.hasOwnProperty(cartItem)) {
				cartItems.push(cartItemsObject[cartItem]);
				totalCost += Number(cartItemsObject[cartItem].cost);
			}
		}

		async.forEach(cartItems, function (cartItem, callback1) {
			createItem(order, cartItem, function (err, item) {
				if (err) {
					return callback(err);
				}
				callback1();
			});
		}, function () {
			return callback(null, order, totalCost);	
		});
	}

	function createOrder(callback) {
		var order = new Order({
			seller: request.session.seller._id,
			payment: {
				method: 'Direct deposit'
			}
		});

		order.save(function (err, order) {
			if (err) {
				return callback(err);
			} 
			attachItemsToOrder(order, callback);
		});
	}
	
	createOrder(function (err, order, totalCost) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			console.log('The total cost is: '.concat(totalCost));
			response.render('orders/bank-account-details-page', {
				amountDue: totalCost,
				referenceNumber: order._id,
				loggedIn: true
			});
		}
	});
}

/**
 * Responds to HTTP GET /order/pay.
 *
 * @param	{object}	request		An HTTP request object received from the express.post() method.
 * @param	{object}	response	An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function payOrder(request, response) {
}

module.exports = {
	showCart: showCart,
	checkout: checkout,
	pay: payOrder
};