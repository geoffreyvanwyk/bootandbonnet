/**
 * For working with the users database table.
 */


var bcrypt  = require('bcrypt');        // For hashing user passwords.
var db      = require('../database');   // For connecting to the database.
var locations   = require('./locations');   // For working with the locations database table.

/**
 * Inserts a new user into the users table, based on data supplied in a form submitted with an HTTP POST request, 
 * and invokes a callback function.
 */
var create = exports.create = function(request, response, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(request.body.password, salt, function(err, hash) {
            var user = {
                username: request.body.email,
                password: hash
            };
            db.query('INSERT INTO users SET ?', user, function(err, result) {
                if (err && err.code === 'ER_DUP_ENTRY') {
                    locations.readAll(function(locations) {
                        response.render('new-seller-form', {
                            emailError: 'Email address already registered.',
                            email: request.body.email,
                            password: request.body.password,
                            firstname: request.body.firstname,
                            surname: request.body.surname,
                            telephone: request.body.telephone,
                            cellphone: request.body.cellphone,
                            dealershipName: request.body.dealershipName,
                            streetAddress1: request.body.streetAddress1,
                            streetAddress2: request.body.streetAddress2,
                            province: request.body.province,
                            town: request.body.town,
                            townId: request.body.townId,
                            locations: locations,
			    			loggedIn: false
                        });
                    });
                }
                else if (err) {
                    throw err;
                }
                else if (callback && typeof(callback) === "function") {
                    callback(result.insertId);
                }
            });
        });
    });
};