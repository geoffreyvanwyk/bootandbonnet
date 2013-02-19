/**
 * For working with the dealerships database table.
 */

var db 		= require('../../../database'); // For connecting to the database.
var sanitizer 	= require('sanitizer');	  // For protecting against cross site scripting.

exports.dealership = {
    /**
     * Inserts a new dealership into the dealerships table, based on data supplied in a form submitted with an HTTP 
     * POST request, and invokes a callback function.
     */
    create: function(request, response, callback) {
	var theDealer = {
	    name: sanitizer.sanitize(request.body.dealershipName),
	    streetAddress1: sanitizer.sanitize(request.body.streetAddress1),
	    streetAddress2: sanitizer.sanitize(request.body.streetAddress2),
	    locationId: request.body.townId
	};
	db.query('INSERT INTO dealerships SET ?', theDealer, function(err, result) {
	    if (err) {
		throw err;
	    }
	    else {
		callback(result.insertId);
	    }
	});
    },

    update: function (request, response, callback) {
	var dealershipId = request.session.dealershipId;
	var theDealership = {
	    name: sanitizer.sanitize(request.body.dealershipName),
	    streetAddress1: sanitizer.sanitize(request.body.streetAddress1),
	    streetAddress2: sanitizer.sanitize(request.body.streetAddress2),
	    locationId: request.body.townId
	};
	db.query('UPDATE dealerships SET ? WHERE id = '.concat(dealershipId), theDealership, function(err, result) {
	    if (err) {
		throw err;
	    }
	    else {
		callback();
	    }
	}); 
    }
};