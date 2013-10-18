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
var paypal = require('paypal-rest-sdk');

/* Import routes */
var main = require('../../routes/main');

/**
 * Responds to HTTP GET /orders/add.
 *
 * @param	{object}	request		An HTTP request object received from the express.get() method.
 * @param	{object}	response	An HTTP response object received from the express.get() method.
 *
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
 *
 * @returns	{undefined}
 */
function confirmOrder(request, response) {
	var item, items;

	items = request.body;
	
	for (item in items) {
		if (items.hasOwnProperty(item)) {
		}
	}
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
	confirm: confirmOrder,
	pay: payOrder
};
