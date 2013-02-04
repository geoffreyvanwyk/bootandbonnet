var db = require('../database');
var bcrypt = require('bcrypt');

exports.showNewSellerForm = function (request, response) {
    response.render('new-seller-form', {
        emailError: '',
        password: '',
        firstname: '',
        surname: '',
        telephone: '',
        cellphone: ''
    });
};

var createUser = exports.createUser = function (request, response, callback) {
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

exports.createSeller = function (request, response) {
    createUser(request, response, function (userId) {
        if (request.body.sellerType === 'privateSeller') {
            var dealershipId = 1;
        }

        var seller = {
            firstname: request.body.firstname,
            surname: request.body.surname,
            telephone: request.body.telephone,
            cellphone: request.body.cellphone,
            dealershipId: dealershipId,
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
};