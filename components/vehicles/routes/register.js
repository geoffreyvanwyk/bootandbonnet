"use strict";
var manufacturers = require('../models/manufacturers').manufacturers;
module.exports.register = {
	add: function(request, response) {
		manufacturers.readModels(function(err, manufacturerObjects) {
			if (err) {
				throw err;
			}
			response.render('register', {
				makes: manufacturerObjects,
				loggedIn: true
			});
		});
	}
};


