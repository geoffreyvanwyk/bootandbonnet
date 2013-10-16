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
	var index, item, items, payment, redirectUrl, transactions;

	transactions = [];
	items = request.body.items;
	console.log('Items: ');
	console.log(items);
	for (item in items) {
		if (items.hasOwnPropery(item)) {
			transaction = {
				amount: {
					total: items[item].cost,
					currency: 'USD'
				},
				description: 'Vehicle adverisement for '.concat(items[item].weeks).concat('weeks.') 
			};

			transactions.push(item);
		}
	}

	console.log('The transactions:');
	console.log(transactions);

	payment = {
		intent: 'sale',
		payer: {
			payment_method: 'paypal'
		},
		redirect_urls: {
			return_url: 'http://localhost:3000/order/pay',
			cancel_url: 'http://yoururl.com/cancel'
		},
		transactions: transactions
	};

	paypal.payment.create(payment, function (err, payment) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			if(payment.payer.payment_method === 'paypal') {
				request.session.paymentId = payment.id;
				for(index = 0; index < payment.links.length; index++) {
					link = payment.links[index];
					if (link.method === 'REDIRECT') {
						redirectUrl = link.href;
					}
				}
				response.redirect(redirectUrl);
			}
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
	var details, payerId, paymentId;

	paymentId = request.session.paymentId;
	payerId = request.param('PayerID');
	details = { "payer_id": payerId };

	paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			console.log(error);
		} else {
			response.send("Hell yeah!");
		}
	});
}

module.exports = {
	showCart: showCart,
	confirm: confirmOrder,
	pay: payOrder
};
