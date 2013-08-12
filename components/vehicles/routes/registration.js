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

var Dealership = require('../../sellers/models/dealerships').Dealership;
var Lookups = require('../../../models/lookups').Lookups;
var Make = require('../models/makes').Make;
var PrivateSeller = require('../../sellers/models/private-sellers').PrivateSeller;
var Vehicle = require('../models/vehicles').Vehicle;

/**
 * Import routes.
 */

var main = require('../../../routes/main');

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
			} else {
				return callback(null, makes, lookups);
			}
		});
	}

	function getLookups(callback) {
		Lookups.find(function (err, lookups) {
			if (err) {
				return callback(err);
			} else {
				getMakes(lookups, callback);
			}
		});
	}

	isSellerLoggedIn = request.session.seller ? true : false;
	if (isSellerLoggedIn) {
		getLookups(function (err, makes, lookups) {
			if (err) {
				console.log(err);
				main.showErrorPage(request, response);
			} else {
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
				response.render('registration-form', locals);
			}
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
	var sessionSeller, formVehicle, uploadDir, newDir, photos, photoPaths, file;

	sessionSeller = request.session.seller;
	formVehicle = request.body.vehicle;
	uploadDir = '/static/img/vehicles/'.concat(sessionSeller._id);
	newDir = __dirname.concat('/../../..').concat(uploadDir);
	photos = [];
	photoPaths = [];

	for (file in request.files) {
		if (request.files.hasOwnProperty(file)) {
			if (request.files[file].size > 0) {
				photos.push(request.files[file]);
			} else {
				fs.unlinkSync(request.files[file].path);
			}
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
 *
 * @param		{object}		request     An HTTP request object received from the express.post() method.
 * @param		{object}		response    An HTTP response object received from the express.post() method.
 *
 * @returns	{undefined}
 */
function editProfile(request, response) {

	function editVehicle(callback) {
		var formVehicle = request.body.vehicle;
		Vehicle.findByIdAndUpdate(formVehicle._id, {
			$set: {
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
				comments: sanitize(formVehicle.comments)
			}
		}, function (err, vehicle) {
			if (err) {
				return callback(err);
			}
			return callback(null, vehicle);
		});
	}

	editVehicle(function (err, vehicle) {
		if (err) {
			console.log(err);
			main.showErrorPage(request, response);
		} else {
			response.redirect(302, '/vehicle/view/'.concat(vehicle._id));
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
					response.render('profile-page', {
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
