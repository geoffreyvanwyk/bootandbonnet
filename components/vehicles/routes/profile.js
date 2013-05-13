"use strict";

var async = require('async');
var coloursPrototype = require('../../../models/colours').colours; 
var fs = require('fs');
var fuelsPrototype = require('../../../models/fuels').fuels;
var home = require('../../../routes/home').index;
var manufacturersPrototype = require('../models/manufacturers').manufacturers;
var transmissionsPrototype = require('../../../models/transmissions').transmissions;
var photoPrototype = require('../../../models/photos').photo;
var vehiclePrototype = require('../models/vehicles').vehicle;

/**
 * Responds to HTTP GET /vehicle/add.
 */
function showRegistrationForm(request, response) {
	var manufacturers = Object.create(manufacturersPrototype);
	manufacturers.readObjects(function (err, manufacturers) {
		if (err) {
			throw err;
		}
		var colours = Object.create(coloursPrototype);
		colours.readNames(function (err, colours) {
			if (err) {
				throw err;
			}
			var fuels = Object.create(fuelsPrototype);
			fuels.readTypes(function (err, fuels) {
				if (err) {
					throw err;
				}
				var transmissions = Object.create(transmissionsPrototype);
				transmissions.readTypes(function (err, transmissions) {
					if (err) {
						throw err;
					}
					response.render('register', {
						makes: manufacturers.objects,
						colours: colours.names,
						fuels: fuels.types,
						transmissions: transmissions.types,
						loggedIn: true
					});
				});
			});
		});
	});
}

/**
 * Responds to HTTP POST /vehicle/add.
 */
function addProfile(request, response) {
	var seller = request.session.seller;
	var vcl = request.body.vehicle;
	var newDir = __dirname.concat('/../../../assets/img/vehicles/').concat(seller.sellerId);
	var photos = [];

	for (var i in request.files) {
		photos.push(request.files[i]);
	}

	function uploadPhotos(vehicle, callback) {
		var counter = 0;
		async.forEach(photos, function (photo, callback1) {
			counter = counter + 1;
			var oldPath = photo.path;
			var newPath = newDir.concat('/').concat(seller.sellerId).concat('-').concat(vehicle.id).concat('-').concat(counter);
			fs.rename(oldPath, newPath, function (err) {
				if (err) {
					return callback(err);
				} 
				var p = Object.create(photoPrototype);
				p.filePath = newPath;
				p.vehicleId = vehicle.id;
				p.create(function (err, p) {
					if (err) {
						return callback(err);
					}
					callback1();
				});
			});
		}, function () {
			return callback(null, vehicle);
		}); 
	}

	function checkDirectory(vehicle, callback) {
		fs.exists(newDir, function (exists) {
			if (exists) {
				uploadPhotos(vehicle, callback);
			} else {
				fs.mkdir(newDir, '0755', function (err) {
					if (err) {
						return callback(err);
					}
					uploadPhotos(vehicle, callback);
				});
			}
		});
	}

	function createVehicle(callback) {
		var vehicle = Object.create(vehiclePrototype);
		vehicle.year = vcl.year;
		vehicle.mileage = vcl.mileage;
		vehicle.price = vcl.price;
		vehicle.comments = vcl.comments;
		vehicle.engineCapacity = vcl.engineCapacity;
		vehicle.powerSteering = vcl.powerSteering;
		vehicle.absBrakes = vcl.absBrakes;
		vehicle.radio = vcl.radio;
		vehicle.cdPlayer = vcl.cdPlayer;
		vehicle.airConditioning = vcl.airConditioning;
		vehicle.electricWindows = vcl.electricWindows;
		vehicle.alarm = vcl.alarm;
		vehicle.centralLocking = vcl.centralLocking;
		vehicle.immobilizer = vcl.immobilizer;
		vehicle.gearLock = vcl.gearLock;
		vehicle.airBags = vcl.airBags;
		vehicle.transmission = vcl.transmission;
		vehicle.color = vcl.color;
		vehicle.fuelType = vcl.fuelType;
		vehicle.sellerId = seller.sellerId;
		vehicle.modelId = vcl.modelId;
		vehicle.townId = seller.townId;
		vehicle.create(function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			checkDirectory(vehicle, callback);	
		});
	}

	createVehicle(function (err, vehicle) {
		if (err) {
			throw err;
		} else {
			showProfile(request, response);
		}
	});
}

function showProfile(request, response) {
	response.render('profile', {
		loggedIn: true
	});
}

module.exports = {
	form: showRegistrationForm,
	add: addProfile,
	show: showProfile
};
