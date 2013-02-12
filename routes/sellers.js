/**
 * For working with the sellers database table.
 */

var db          = require('../database');   // For connecting to the database.
var dealerships = require('./dealerships'); // For working with the dealerships database table.
var locations   = require('./locations');   // For working with the locations database table.
var sanitizer 	= require('sanitizer');	  	// For protecting against cross site scripting.
var users       = require('./users');       // For working with the users database table.

/**
 * Displays the seller-form page in the web browser.
 */
exports.showSellerForm = function(request, response) {
    locations.readAll(function(allLocations) {
        response.render('seller-form', {
            emailError: '',
            email: '',
            password: '',
            firstname: '',
            surname: '',
            telephone: '',
            cellphone: '',
            dealershipName: '',
            streetAddress1: '',
            streetAddress2: '',
            province: '',
            town: '',
            townId: '',
            locations: allLocations,
            loggedIn: false
        });
    });
};

/**
 * Displays the seller profile page in the web browser.
 */
function showSeller(request, response) {
    if (request.session.username) {
	var seller = {
	    email: request.session.username,
	    fullname: request.session.firstname.concat(' ').concat(request.session.surname),
	    loggedIn: true
	};
    	response.render('seller', seller);
    } else {
	 	response.render('home', {loggedIn: false});
    }
};

exports.showSeller = showSeller;

/**
 * Inserts a new user, dealership, and seller into the users, dealerships, and sellers tables, respectively, and 
 * displays the seller-profile page in the web browser.
 */
exports.create = function(request, response) {
    function createSeller(request, response, dealershipId, userId, callback) {           
        var seller = {
            firstname: sanitizer.sanitize(request.body.firstname),
            surname: sanitizer.sanitize(request.body.surname),
            telephone: sanitizer.sanitize(request.body.telephone),
            cellphone: sanitizer.sanitize(request.body.cellphone),
            dealershipId: dealershipId,
            userId: userId 
        };
    
        db.query('INSERT INTO sellers SET ?', seller, function(err, result) {
            if (err) {
                throw err;
            } else {
		    	request.session.username = sanitizer.sanitize(request.body.email);
                request.session.firstname = sanitizer.sanitize(request.body.firstname);
                request.session.surname = sanitizer.sanitize(request.body.surname);
                request.session.telephone = sanitizer.sanitize(request.body.telephone);
                request.session.cellphone = sanitizer.sanitize(request.body.cellphone); 
				request.session.sellerType = request.body.sellerType;
                request.session.province = request.body.province;
				if (request.body.sellerType === "dealership") {
					request.session.dealershipName = sanitizer.sanitize(request.body.dealershipName);	
				}
				request.session.town = request.body.town;
				request.session.townId = request.body.townId;
                callback(request, response);
            }
        });
    }
    
    users.create(request, response, function(userId) {
        switch (request.body.sellerType) {
            case 'privateSeller':
                createSeller(request, response, 1, userId, showSeller);
                break;
            case 'dealership':
                dealerships.create(request, response, function(dealershipId) {
                    createSeller(response, request, dealershipId, userId, showSeller);
                });
                break;
        }
    });
};