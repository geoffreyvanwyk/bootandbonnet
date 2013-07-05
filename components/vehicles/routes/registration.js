"use strict";

/**
 * Import external modules.
 */

var async = require('async');

/**
 * Import built-in modules.
 */

var fs = require('fs'); // For uploading photos.

/**
 * Import libraries.
 */

var sanitize = require('../../../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/**
 * Import models.
 */

var Make = require('../models/makes').Make;
var Vehicle = require('../models/vehicles').Vehicle;
var Lookups = require('../../../models/lookups').Lookups;

/**
 * Import routes.
 */

var main = require('../../../routes/main');

/**
 * Responds to HTTP GET /vehicle/add and HTTP GET /vehicle/edit.
 *
 * Displays the vehicle registration-form, to either add or edit a vehicle profile, followed by the newly
 * registered vehicle's profile.
 *
 * If a seller is not logged-in,
 * logged-in, a new profile cannot be added, so the function will do nothing. If a seller is not
 * logged-in, a profile cannot be edited, so the function will do nothing.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showRegistrationForm(request, response) {
	Make.find(function (err, makes) {
		if (err) {
			console.log(err);
			return main.showErrorPage(request, response);
		} else {
			Lookups.find(function (err, lookups) {
				if (err) {
					console.log(err);
					return main.showErrorPage(request, response);
				} else {
					response.render('registration-form', {
						makes: makes,
						colors: lookups[0].colors,
						fuels: lookups[0].fuels,
						transmissions: lookups[0].transmissions,
						loggedIn: true
					});
				}
			});
		}
	});
}

/**
 * Responds to HTTP POST /vehicle/add.
 */
function addProfile(request, response) {
	var sessionSeller = request.session.seller;
	var formVehicle = request.body.vehicle;
	var uploadDir = '/static/img/vehicles/'.concat(sessionSeller._id);
	var newDir = __dirname.concat('/../../..').concat(uploadDir);
	var photos = [];
	var photoPaths = [];

	for (var i in request.files) {
		if (request.files[i].size > 0) {
			photos.push(request.files[i]);
		} else {
			fs.unlinkSync(request.files[i].path);
		}
	}

	function uploadPhotos(vehicle, callback) {
		var counter = 0;
		async.forEach(photos, function (photo, callback1) {
			counter = counter + 1;
			var oldPath = photo.path;
			var newFileName = sessionSeller._id
								.concat('-')
								.concat(vehicle._id)
								.concat('-')
								.concat(counter);
			var newPath = newDir.concat('/').concat(newFileName);
			fs.rename(oldPath, newPath, function (err) {
				if (err) {
					return callback(err);
				}
				photoPaths.push(uploadDir.concat('/').concat(newFileName));
				callback1();
			});
		}, function () {
			vehicle.photos = photoPaths;
			vehicle.save(function (err, vehicle) {
				if (err) {
					return callback(err);
				}
				return callback(null, vehicle);
			});
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
	
	function addVehicle(callback) {
		var vehicle = new Vehicle({
			type: {
				make: sanitize(formVehicle.type.make), 
				model: sanitize(formVehicle.type.model),
				year: sanitize(formVehicle.type.year) 
			},
			description: {
				mileage: sanitize(formVehicle.description.mileage),
				color: sanitize(formVehicle.description.color),
				fullServiceHistory: sanitize(formVehicle.description.fullServiceHistory) 
			},
			mechanics: {
				engineCapacity: sanitize(formVehicle.mechanics.engineCapacity),
				fuel: sanitize(formVehicle.mechanics.fuel),
				transmission: sanitize(formVehicle.mechanics.transmission),
				absBrakes: sanitize(formVehicle.absBrakes),
				powerSteering: sanitize(formVehicle.mechanics.powerSteering)
			},
			luxuries: {
				airConditioning: sanitize(formVehicle.luxuries.airConditioning),
				electricWindows: sanitize(formVehicle.luxuries.electricWindows),
				radio: sanitize(formVehicle.luxuries.radio),
				cdPlayer: sanitize(formVehicle.luxuries.cdPlayer) 
			},
			security: {
				alarm: sanitize(formVehicle.security.alarm),
				centralLocking: sanitize(formVehicle.security.centralLocking),
				immobilizer: sanitize(formVehicle.security.immobilizer),
				gearLock: sanitize(formVehicle.security.gearLock) 
			},
			safety: {
				airBags: sanitize(formVehicle.safety.airBags) 
			},
			price: {
				value: sanitize(formVehicle.price.value), 
				negotiable: sanitize(formVehicle.price.negotiable) 
			},
			comments: sanitize(formVehicle.comments),
			seller: sessionSeller._id
		});
		
		vehicle.save(function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			checkDirectory(vehicle, callback);
		});
	}

	addVehicle(function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			response.redirect(302, '/vehicle/view/'.concat(vehicle._id));
		}
	});
}

/**
 * Responds to HTTP POST /vehicle/edit.
 */
function editProfile(request, response) {

}

/**
 * Responds to HTTP GET /vehicle/remove.
 */
function removeProfile(request, response) {

}

/**
 * Responds to HTTP GET /vehicle/view/:vehicleId.
 */
function showProfile(request, response) {
	var vehicleId = request.params.vehicleId.toString();
	Vehicle.findById(vehicleId, function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			response.render('profile-page', {
				vehicle: vehicle,
				loggedIn: request.session.seller ? true : false
			});
		}
	});
}

/**
 * Responds to HTTP GET /vehicle/:vid/image/:iid.
 */
function sendFile(request, response) {
	response.send(path.resolve('./assets/img/vehicles/2/'.concat(request.params.iid)));
}

function listVehicles(request, response) {
	var seller = request.session.seller;
	var vehicles = Object.create(vehiclesPrototype);
	var sellerId = {
		name: 'sellerId',
		value: seller.sellerId
	};
	vehicles.readBy(sellerId, function (err, vehicles) {
		if (err) {
			throw err;
		} else {
			response.render('list', {
				loggedIn: true,
				vehicles: vehicles.objects
			});
		}
	});
}

module.exports = {
	showRegistrationForm: showRegistrationForm,
	addProfile: addProfile,
	editProfile: editProfile,
	removeProfile: removeProfile,
	showProfile: showProfile,
	listVehicles: listVehicles
};
