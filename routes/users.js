var bcrypt = require('bcrypt');
var db = require('../database');
var locations = require('./locations');

exports.showNewSellerForm = function (request, response) {
    locations.read(function (provinces, locations) {
        response.render('new-seller-form', {
            emailError: '',
            password: '',
            firstname: '',
            surname: '',
            telephone: '',
            cellphone: '',
            locations: locations,
            provinces: provinces
        });
    });
};

var createUser = function (request, response, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(request.body.password, salt, function (err, hash) {
            var user = {
                username: request.body.email,
                password: hash
            };

            db.query('INSERT INTO users SET ?', user, function (err, result) {
                if (err && err.code === 'ER_DUP_ENTRY') {
                    response.render('new-seller-form', {
                        emailError: 'Email address already registered.',
                        email: request.body.email,
                        password: request.body.password,
                        firstname: request.body.firstname,
                        surname: request.body.surname,
                        telephone: request.body.telephone,
                        cellphone: request.body.cellphone
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


var createDealership = function (request, response, callback) {
    var dealership = {
        name: request.body.dealershipName,
        streetAddress1: request.body.streetAddress1,
        streetAddress2: request.body.streetAddress2,
        locationId: request.body.townId
    };

    db.query('INSERT INTO dealerships SET ?', dealership, function (err, result) {
        if (err) {
            throw err;
        }
        else {
            callback(result.insertId);
        }
    });
};

exports.createSeller = function (request, response) {
    createUser(request, response, function (userId) {
        createDealership(request, response, function (dealershipId) {
            var newDealershipId;

            switch (request.body.sellerType) {
                case 'privateSeller':
                    newDealershipId = 1;
                    break;
                case 'dealership':
                    newDealershipId = dealershipId;
                    break;
            }

            var seller = {
                firstname: request.body.firstname,
                surname: request.body.surname,
                telephone: request.body.telephone,
                cellphone: request.body.cellphone,
                dealershipId: newDealershipId,
                userId: userId
            };

            db.query('INSERT INTO sellers SET ?', seller, function (err, result) {
                if (err) {
                    // Render error page here.
                    throw err;
                }
                else {
                    response.render('home', {});
                }
            });
        });
    });
};