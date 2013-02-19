/**
 * For working with the sellers database table.
 */

var db          = require('../../../database');      	// For connecting to the database.
var dealerships = require('./dealerships'); 		// For working with the dealerships database table.
var locations   = require('../../../routes/locations');	// For working with the locations database table.
var sanitizer 	= require('sanitizer');	    		// For protecting against cross-site scripting.
var user        = require('./users').user;       	// For working with the users database table.

var seller = exports.seller = {
    /**
     * Responds to: GET /seller/new
     * Displays the seller-form page in the web browser. 
     */
    showNewForm: function (request, response) {
	if (!request.session.username) { // If the user is not logged-in.
	    locations.readProvinceObjects(function(provinceObjects) {
		response.render('seller-form', {
		    heading: 'New Seller',
		    method: 'post',
		    buttonCaption: 'Register',
		    emailError: '',
		    email: '',
		    password: '',
		    firstname: '',
		    surname: '',
		    telephone: '',
		    cellphone: '',
		    sellerType: '',
		    dealershipName: '',
		    streetAddress1: '',
		    streetAddress2: '',
		    province: '',
		    town: '',
		    townId: '',
		    provinces: provinceObjects,
		    loggedIn: false
		});
	    });
	}
    },

    /**
     * Responds to: GET /seller/edit
     * Displays the seller-form page in the web browser with the logged in user's details prefilled.
     */
    showEditForm: function (request, response) {
	if (request.session.username) { // If the user is logged-in.
	    locations.readProvinceObjects(function(provinceObjects) {
		response.render('seller-form', {
		    heading: 'Edit Seller',
		    method: 'put',
		    buttonCaption: 'Save changes',
		    emailError: '',
		    email: request.session.username,
		    password: '',
		    firstname: request.session.firstname, 
		    surname: request.session.surname,
		    telephone: request.session.telephone,
		    cellphone: request.session.cellphone,
		    sellerType: request.session.sellerType,
		    dealershipName: request.session.dealershipName || '',
		    streetAddress1: request.session.streetAddress1 || '',
		    streetAddress2: request.session.streetAddress2 || '',
		    province: request.session.province,
		    town: request.session.town,
		    townId: request.session.townId,
		    provinces: provinceObjects,
		    loggedIn: true 
		});
	    });
	}
    },

    /**
     * Responds to: POST /seller
     * Inserts a new user, dealership, and seller into the users, dealerships, and sellers tables, respectively, and 
     * displays the seller-profile page in the web browser.
     */
    create: function (request, response) {
	function createSeller(request, response, dealershipId, userId, callback) {           
	    var newSeller = {
		firstname: sanitizer.sanitize(request.body.firstname),
		surname: sanitizer.sanitize(request.body.surname),
		telephone: sanitizer.sanitize(request.body.telephone),
		cellphone: sanitizer.sanitize(request.body.cellphone),
		dealershipId: dealershipId,
		userId: userId 
	    };
    
	    db.query('INSERT INTO sellers SET ?', newSeller, function(err, result) {
		if (err) {
		    throw err;
		} else {
		    request.session.userId = userId;
		    request.session.sellerId = result.insertId;
		    request.session.username = sanitizer.sanitize(request.body.email);
		    request.session.firstname = sanitizer.sanitize(request.body.firstname);
		    request.session.surname = sanitizer.sanitize(request.body.surname);
		    request.session.telephone = sanitizer.sanitize(request.body.telephone);
		    request.session.cellphone = sanitizer.sanitize(request.body.cellphone); 
		    request.session.sellerType = request.body.sellerType;
		    
		    if (request.body.sellerType === "dealership") {
			request.session.dealershipId = dealershipId;
			request.session.dealershipName = sanitizer.sanitize(request.body.dealershipName);	
			request.session.streetAddress1 = sanitizer.sanitize(request.body.streetAddress1); 
			request.session.streetAddress2 = sanitizer.sanitize(request.body.streetAddress2); 
			request.session.town = request.body.town;
			request.session.townId = request.body.townId;	
			request.session.province = request.body.province;	
		    }
		    
		    callback(request, response, result.insertId);
		}
	    });
	}
    
	user.create(request, response, function(userId) {
	    switch (request.body.sellerType) {
		case 'privateSeller':
		    createSeller(request, response, 1, userId, seller.read);
		    break;
		case 'dealership':
		    dealerships.create(request, response, function(dealershipId) {
			createSeller(request, response, dealershipId, userId, seller.read);
		    });
		    break;
	    }
	});
    },
    
    /**
     * Responds to: GET /seller
     * Displays the seller profile page in the web browser. 
     */
    read: function (request, response, sellerId) {
	if (request.session.username) { // Is the user logged in?
	    request.session.sellerId = sellerId;
	    var theSeller = {
		email: request.session.username,
		fullname: request.session.firstname.concat(' ').concat(request.session.surname),
		telephone: request.session.telephone,
		cellphone: request.session.cellphone,
		sellerType: 'Private seller',
		dealershipName: '',
		streetAddress1: '',
		streetAddress2: '',
		province: '',
		town: '',
		loggedIn: true
	    };
	    if (request.session.sellerType === 'dealership') {
		theSeller.sellerType = 'dealership';
		theSeller.dealershipName = request.session.dealershipName;
		theSeller.streetAddress1 = request.session.streetAddress1;
		theSeller.streetAddress2 = request.session.streetAddress2;
		theSeller.province = request.session.province;
		theSeller.town = request.session.town;
	    }
	    response.render('seller', theSeller);
	} else { // The user is not logged in.
	    response.render('home', {
		loggedIn: false
	    });
	}
    },

    /**
     * Responds to: PUT /seller
     * Displays the seller profile page in the web browser. 
     */
    update: function (request, response) {
	var userId = request.session.userId;
	var dealershipId = request.session.dealershipId;
	var sellerId = request.session.sellerId;
	console.log("The sellerId is ".concat(sellerId));
	function updateSeller(request, response, sellerId, dealershipId, userId, callback) {           
	    var theSeller = {
		firstname: sanitizer.sanitize(request.body.firstname),
		surname: sanitizer.sanitize(request.body.surname),
		telephone: sanitizer.sanitize(request.body.telephone),
		cellphone: sanitizer.sanitize(request.body.cellphone),
		dealershipId: dealershipId,
		userId: userId 
	    };
    
	    db.query('UPDATE sellers SET ? WHERE id = '.concat(sellerId), theSeller, function(err, result) {
		if (err) {
		    throw err;
		} else {
		    request.session.username = sanitizer.sanitize(request.body.email);
		    request.session.firstname = sanitizer.sanitize(request.body.firstname);
		    request.session.surname = sanitizer.sanitize(request.body.surname);
		    request.session.telephone = sanitizer.sanitize(request.body.telephone);
		    request.session.cellphone = sanitizer.sanitize(request.body.cellphone); 
		    request.session.sellerType = request.body.sellerType;
		    
		    if (request.body.sellerType === "dealership") {
			request.session.dealershipName = sanitizer.sanitize(request.body.dealershipName);	
			request.session.streetAddress1 = sanitizer.sanitize(request.body.streetAddress1); 
			request.session.streetAddress2 = sanitizer.sanitize(request.body.streetAddress2); 
			request.session.town = request.body.town;
			request.session.townId = request.body.townId;	
			request.session.province = request.body.province;	
		    }
		    
		    callback(request, response, result);
		}
	    });
	}
    
	user.update(request, userId, function() {
	    switch (request.body.sellerType) {
		case 'privateSeller':
		    updateSeller(request, response, sellerId, 1, userId, seller.read);
		    break;
		case 'dealership':
		    dealerships.update(request, response, function() {
			updateSeller(request, response, sellerId, dealershipId, userId, seller.read);
		    });
		    break;
	    }
	});
    },

    del: function () {
	
    }
};