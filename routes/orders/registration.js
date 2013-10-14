/*jslint node: true */

'use strict';

/*
 * Component: orders
 *
 * File: routes/orders/registration.js
 *
 * Purpose: Contains routes for the handling of orders.
 */

/**
 * Responds to HTTP GET /orders/add.
 *
 * @param	{object}	request		An HTTP request object received from the express.get() method.
 * @param	{object}	response	An HTTP response object received from the express.get() method.
 *
 * @return	{undefined}
 */
function showCart(request, response) {
	var items;
	items = request.query.items;
	response.render('orders/cart-form', {
		loggedIn: true,
		items: items
	});
}

module.exports = {
	showCart: showCart
};