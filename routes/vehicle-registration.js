/*jshint node: true */

'use strict';

/*
 * Component: vehicles
 *
 * File: routes/vehicles/registration.js
 *
 * Purpose: Contains routes for handling registration of new vehicles and modification of existing vehicles.
 */

/* Import external modules. */
var async = require('async'); // For asynchronous iteration.

/* Import built-in modules. */
var fs = require('fs'); // For uploading photos.
var path = require('path'); // For concatenating file paths.

/* Import libraries. */
var sanitize = require('../library/sanitize-wrapper').sanitize; // For removing scripts from user input.

/* Import models. */
var Lookups = require('../models/lookups');
var Make = require('../models/makes');
var Seller = require('../models/sellers');
var User = require('../models/users');
var Vehicle = require('../models/vehicles');

/* Import routes. */
var main = require('./main');

/* Helper functions */

function movePhotos(vehicle, files, vehicleDir, webDir, callback) {
	var counter, file, newPath, oldPath, photos;

	photos = [];

	for (file in files) {
		if (files.hasOwnProperty(file)) {
			if (files[file].size > 0) {
				photos.push(files[file]);
			} else {
				fs.unlinkSync(files[file].path);
			}
		}
	}

	counter = vehicle.photos.length;

	async.forEach(photos, function (photo, callback1) {
		counter = counter + 1;
		oldPath = photo.path;
		newPath = path.join(vehicleDir, counter.toString());
		vehicle.photos.push(path.join(webDir, counter.toString()));

		fs.rename(oldPath, newPath, function (err) {
			if (err) {
				return callback(err);
			}
			callback1();
		});

	}, function () {
		return callback(null, vehicle);
	});
}

function makeDirectory(vehicle, files, vehicleDir, webDir, callback) {
	fs.mkdir(vehicleDir, '0755', function (err) {
		if (err) {
			return callback(err);
		}
		movePhotos(vehicle, files, vehicleDir, webDir, callback);
	});
}

function checkDirectory(vehicle, files, callback) {
	var vehicleDir, webDir;

	webDir = path.join('/uploads/img/vehicles', vehicle._id.toString());
	vehicleDir = path.join(__dirname, '..', '..', webDir);

	fs.exists(vehicleDir, function (exists) {
		if (exists) {
			movePhotos(vehicle, files, vehicleDir, webDir, callback);
		} else {
			makeDirectory(vehicle, files, vehicleDir, webDir, callback);
		}
	});
}

/* Routes */

/**
 * Responds to HTTP GET /vehicle/add and HTTP GET /vehicle/edit.
 *
 * Displays vehicle registration-form, to either add or edit a vehicle profile.
 *
 * If a seller is not logged-in, a new profile can neither be added nor edited.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showRegistrationForm(request, response) {
	var action, isSellerLoggedIn, locals;

	function getMakes(lookups, callback) {
		Make.find(function (err, makes) {
			if (err) {
				return callback(err);
			}
			return callback(null, makes, lookups);
		});
	}

	function getLookups(callback) {
		Lookups.find(function (err, lookups) {
			if (err) {
				return callback(err);
			}
			getMakes(lookups, callback);
		});
	}

	isSellerLoggedIn = request.session.seller ? true : false;
	if (isSellerLoggedIn) {
		getLookups(function (err, makes, lookups) {
			if (err) {
				console.log(err);
				main.showErrorPage(request, response);
				return;
			}
			locals = {
				makes: makes,
				colors: lookups[0].colors,
				fuels: lookups[0].fuels,
				transmissions: lookups[0].transmissions,
				loggedIn: true
			};
			action = request.path.split('/').slice(-1)[0];
			if (action === 'add') {
				locals.method = 'add';
				locals.heading = 'Add Vehicle';
				locals.buttonCaption = 'Register';
				locals.vehicle = null;
			} else if (action === 'edit') {
				locals.method = 'edit';
				locals.heading = 'Edit Vehicle';
				locals.buttonCaption = 'Save Changes';
				locals.vehicle = request.session.vehicle;
			}
			response.render('vehicles/registration-form', locals);
		});
	}
}

/**
 * Responds to HTTP POST /vehicle/add.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function addProfile(request, response) {

	function instantiateVehicle(callback) {
		var formVehicle, seller, vehicle;

		seller = request.session.seller;
		formVehicle = request.body.vehicle;
		vehicle = new Vehicle({
			market: sanitize(formVehicle.market),
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
			photos: [],
			comments: sanitize(formVehicle.comments),
			seller: seller._id
		});

		checkDirectory(vehicle, request.files, callback);
	}

	function insertVehicle(vehicle, callback) {
		vehicle.save(function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			return callback(null, vehicle);
		});
	}

	function createVehicle(callback) {
		instantiateVehicle(function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			insertVehicle(vehicle, callback);
		});
	}

	createVehicle(function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
			return;
		}
		response.redirect(302, path.join('/vehicle/view', vehicle._id.toString()));
	});
}

/**
 * Responds to HTTP POST /vehicle/edit.
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function editProfile(request, response) {
	var formVehicle = request.body.vehicle;

	function instantiateVehicle(callback) {
		var sessionVehicle, vehicle;
		sessionVehicle = request.session.vehicle;
		vehicle = {
			_id: sanitize(formVehicle._id),
			market: sanitize(formVehicle.market),
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
			photos: sessionVehicle.photos
		};

		checkDirectory(vehicle, request.files, callback);
	}

	function updateVehicle(vehicle, callback) {
		delete vehicle._id;
		Vehicle.findByIdAndUpdate(formVehicle._id, {
			$set: vehicle
		}, function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			return callback(null, vehicle);
		});
	}

	function editVehicle(callback) {
		instantiateVehicle(function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			updateVehicle(vehicle, callback);
		});
	}

	editVehicle(function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			response.redirect(302, path.join('/vehicle/view/', vehicle._id.toString()));
		}
	});
}

/**
 * Responds to HTTP GET /vehicle/remove.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function removeProfile(request, response) {
	// TODO Make sure that a seller is logged-in and the he is the seller of the vehicle.
	var sessionVehicle;
	sessionVehicle = request.session.vehicle;
	Vehicle.findById(sessionVehicle._id, function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			vehicle.remove(function (err) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else {
					listSellerVehicles(request, response);
				}

			});
		}
	});
}

/**
 * Responds to HTTP GET /vehicle/view/:vehicleId.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 *
 * @returns	{undefined}
 */
function showProfile(request, response) {
	var vehicleId = request.params.vehicleId.toString();

	function findSeller(sellerId, callback) {
		PrivateSeller.findOne({account: sellerId}).populate('account').exec(function (err, seller) {
			if (err) {
				return callback(err);
			} else if (!seller) {
				Dealership.findOne({account: sellerId}).populate('account').exec(function (err, seller) {
					if (err) {
						return callback(err);
					} else {
						seller.type = 'dealership';
						return callback(null, seller);
					}
				});
			} else {
				seller.type = 'private seller';
				return callback(null, seller);
			}
		});
	}

	Vehicle.findById(vehicleId, function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			request.session.vehicle = vehicle;
			findSeller(vehicle.seller, function (err, seller) {
				if (err) {
					console.log(err);
					main.showErrorPage(request, response);
				} else {
					if (request.session.seller) {
						var isSameSeller = (request.session.seller._id == vehicle.seller);
					} else {
						var isSameSeller = false;
					}
					response.render('vehicles/profile-page', {
						vehicle: vehicle,
						seller: seller,
						isSameSeller: isSameSeller,
						loggedIn: request.session.seller ? true : false
					});
				}
			});
		}
	});
}

/**
 * Responds to HTTP GET /vehicle/:vehicleId/photo/:photoId.
 *
 * @param		{object}		request     An HTTP request object received from the express.get() method.
 * @param		{object}		response    An HTTP response object received from the express.get() method.
 */
function sendPhoto(request, response) {
	response.sendfile(path.join(__dirname, '..', '..', 'uploads/img/vehicles',
							request.params.vehicleId, request.params.photoId));
}

function listSellerVehicles(request, response) {
	var seller;

	seller = request.session.seller;

	Vehicle.find({seller: seller._id}, function (err, vehicles) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			response.render('vehicles/list-seller-vehicles-page', {
				loggedIn: true,
				vehicles: vehicles
			});
		}
	});
}

module.exports = {
	showRegistrationForm: showRegistrationForm,
	addProfile: addProfile,
	showProfile: showProfile,
	editProfile: editProfile,
	removeProfile: removeProfile,
	sendPhoto: sendPhoto,
	listSellerVehicles: listSellerVehicles
};
