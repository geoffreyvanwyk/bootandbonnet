/*jshint node: true */

'use strict';

/**
 * @file routes/vehicles/registration.js
 * @summary Component: Vehicle Registration. Contains routes for handling registration of new vehicles and modification
 * of existing vehicles.
 */

/* Import external modules. */
var async = require('async'); // For asynchronous iteration.
var rimraf = require('rimraf');

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
var sellers = require('./seller-registration');

/**
 * @summary Handles all the errors in this module.
 *
 * @param {object} err An error object.
 * @param {object} request An HTTP request object received from the express.get() method.
 * @param {object} response An HTTP response object received from the express.get() method.
 *
 * @returns {undefined}
 */
var handleErrors = function (err, request, response) {
	console.log('==================== BEGIN ERROR MESSAGE ====================');
	console.log(err);
	console.log('==================== END ERROR MESSAGE ======================');

	switch (err.message) {
		case 'You are not logged-in.':
			request.session.specialError = {
				message: err.message,
				action: err.action,
				alertDisplay: ''
			};
			response.redirect(302, '/sellers/add');
			break;
		case 'You can only delete your own vehicles.':
			request.session.specialError = err.message;
			response.redirect(302, '/error');
			break;
		case 'A vehicle with the requested id does not exist.':
			request.session.specialError = err.message;
			response.redirect(302, '/error');
			break;
		case 'A seller with the requested id does not exist.':
			request.session.specialError = err.message;
			response.redirect(302, '/error');
			break;
		case 'A user with the requested id does not exist.':
			request.session.specialError = err.message;
			response.redirect(302, '/error');
			break;
		case "The vehicle's advertisement period has expired.":
			request.session.specialError = err.message;
			response.redirect(302, '/error');
			break;
		default:
			response.redirect(302, '/error');
			break;
	}
};

/* Helper functions */
var movePhotos = function (vehicle, files, vehicleDir, webDir, callback) {
	var counter, newPath, oldPath;

	var photos = [];

	for (var file in files) {
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
};

var makeDirectory = function (vehicle, files, vehicleDir, webDir, callback) {
	fs.mkdir(vehicleDir, '0755', function (err) {
		if (err) {
			return callback(err);
		}
		movePhotos(vehicle, files, vehicleDir, webDir, callback);
	});
};

var checkDirectory = function (vehicle, files, callback) {
	var webDir = path.join('/uploads/img/vehicles', vehicle._id.toString());
	var vehicleDir = path.join(__dirname, '..', webDir);

	fs.exists(vehicleDir, function (exists) {
		if (exists) {
			movePhotos(vehicle, files, vehicleDir, webDir, callback);
		} else {
			makeDirectory(vehicle, files, vehicleDir, webDir, callback);
		}
	});
};

/**
 * @summary Returns all the make documents makes database collection. Each make document also include the models of that
 * make.
 *
 * @param {object} vehicle The vehicle object passed by the vehicles.showEditForm method.
 * @param {ojbect} lookups The lookup values for colors, fuel types, transmission types, etc.
 * @param {function} callback A callback function.
 *
 * @returns {undefined}
 */
var getMakes = function (vehicle, lookups, callback) {
	Make.find(function (err, makes) {
		if (err) {
			return callback(err);
		}
		return callback(null, vehicle, makes, lookups);
	});
};

/**
 * @summary Returns all the lookup values for colors, fuel types, transmission types, etc. from the lookups database
 * collection.
 *
 * @param {object} vehicle The vehicle object passed by the vehicles.showEditForm method.
 * @param {function} callback A callback function.
 *
 * @returns {undefined}
 */
var getLookups = function (vehicle, callback) {
	Lookups.find(function (err, lookups) {
		if (err) {
			return callback(err);
		}
		getMakes(vehicle, lookups, callback);
	});
};

/**
 * @summary Returns true, if a seller is logged-in; otherwise, it displays an error message, then returns false.
 *
 * @param {object} request An HTTP request object received from the express.get() or express.post() method.
 * @param {object} response An HTTP response object received from the express.get() or express.post() method.
 *
 * @returns {boolean}
 */
var isLoggedIn = function (action, request, response) {
	var displayError = function () {
		var error = new Error('You are not logged-in.');
		error.action = action;
		handleErrors(error, request, response);
		return false;
	};

	return !!request.session.seller || displayError();
};

/* Routes */
var vehicles = module.exports = {
	/**
	 * @summary Responds to HTTP GET /vehicles/add. Displays views/vehicle-registration-form.ejs.
	 *
	 * @description Preconditions:
	 * (1) A seller has to be logged-in (function isLoggedIn).
	 *
	 * Error handling:
	 * (1) If a seller is not logged-in, an appropriate error message is displayed.
	 * (2) All errors are handled by the handleErrors function.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns	{undefined}
	 */
	showRegistrationForm: function (request, response) {
		if (isLoggedIn('add', request, response)) {
			var currentDateObject = new Date(Date.now());

			getLookups(null, function (err, vehicle, makes, lookups) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.render('vehicle-registration-form', {
						action: '/vehicles/add',
						heading:  'Add Vehicle',
						buttonCaption: 'Register',
						seller: request.session.seller,
						vehicle: {
							_id: '',
							market: '',
							type: {
								make: '',
								model: '',
								year: ''
							},
							description: {
								mileage: '',
								color: '',
								fullServiceHistory: ''
							},
							mechanics: {
								engineCapacity: '',
								fuel: '',
								transmission: '',
								absBrakes: '',
								powerSteering: ''
							},
							luxuries: {
								airConditioning: '',
								electricWindows: '',
								radio: '',
								cdPlayer: ''
							},
							security: {
								alarm: '',
								centralLocking: '',
								immobilizer: '',
								gearLock: ''
							},
							safety: {
								airBags: ''
							},
							price: {
								value: '',
								negotiable: ''
							},
							photos: [],
							comments: '',
							seller: ''
						},
						makes: makes,
						manufacturersString: JSON.stringify(makes),
						colors: lookups[0].colors,
						fuels: lookups[0].fuels,
						transmissions: lookups[0].transmissions,
						thisYear: currentDateObject.getFullYear(),
						isLoggedIn: true
					});
				}
			});
		}
	},
	/**
	 * @summary Responds to HTTP POST /vehicles/add. Adds a new vehicle profile, then displays it
	 * (views/vehicle-profile-page.ejs).
	 *
	 * @description Preconditions:
	 * (1) A seller has to be logged-in (function isLoggedIn).
	 *
	 * Error handling:
	 * (1) If a seller is not logged-in, an appropriate error message is displayed.
	 * (2) All errors are handled by the handleErrors function.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns	{undefined}
	 */
	add: function (request, response) {
		if (isLoggedIn('add', request, response)) {
			var instantiateVehicle = function (callback) {
				var ssnSeller = request.session.seller;
				var frmVehicle = request.body.vehicle;

				var vehicle = new Vehicle({
					market: sanitize(frmVehicle.market),
					type: {
						make: sanitize(frmVehicle.type.make),
						model: sanitize(frmVehicle.type.model),
						year: sanitize(frmVehicle.type.year)
					},
					description: {
						mileage: sanitize(frmVehicle.description.mileage),
						color: sanitize(frmVehicle.description.color),
						fullServiceHistory: sanitize(frmVehicle.description.fullServiceHistory)
					},
					mechanics: {
						engineCapacity: sanitize(frmVehicle.mechanics.engineCapacity),
						fuel: sanitize(frmVehicle.mechanics.fuel),
						transmission: sanitize(frmVehicle.mechanics.transmission),
						absBrakes: sanitize(frmVehicle.absBrakes),
						powerSteering: sanitize(frmVehicle.mechanics.powerSteering)
					},
					luxuries: {
						airConditioning: sanitize(frmVehicle.luxuries.airConditioning),
						electricWindows: sanitize(frmVehicle.luxuries.electricWindows),
						radio: sanitize(frmVehicle.luxuries.radio),
						cdPlayer: sanitize(frmVehicle.luxuries.cdPlayer)
					},
					security: {
						alarm: sanitize(frmVehicle.security.alarm),
						centralLocking: sanitize(frmVehicle.security.centralLocking),
						immobilizer: sanitize(frmVehicle.security.immobilizer),
						gearLock: sanitize(frmVehicle.security.gearLock)
					},
					safety: {
						airBags: sanitize(frmVehicle.safety.airBags)
					},
					price: {
						value: sanitize(frmVehicle.price.value),
						negotiable: sanitize(frmVehicle.price.negotiable)
					},
					photos: [],
					comments: sanitize(frmVehicle.comments),
					seller: ssnSeller._id
				});

				checkDirectory(vehicle, request.files, callback);
			};

			var insertVehicle = function (vehicle, callback) {
				vehicle.save(function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					return callback(null, vehicle);
				});
			};

			var createVehicle = function (callback) {
				instantiateVehicle(function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					insertVehicle(vehicle, callback);
				});
			};

			createVehicle(function (err, vehicle) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.redirect(302, path.join('/vehicles', vehicle._id.toString(), 'view'));
				}
			});
		}
	},
	/**
	* @summary Responds to HTTP GET /vehicles/:vehicleId/view. Displays the views/vehicle-profile-page.ejs.
	*
	* @description Preconditions:
	* (1) The user must be authorized to view the profile (function checkAuthorization).
	*
	* Postconditions:
	* (1) If a seller is logged-in, and the vehicle belongs to him/her, edit and delete buttons should also be
	* displayed.
	*
	* Algorithm:
	* (1) The vehicle referenced by the id in the url (:vehicleId) is first retrieved from the database (function
	* findVehicle).
	* (2) The the checkAuthorization function checks whether the user is authorized to view the vehicle profile.
	* (3) Then the seller, who owns the vehicle, is retrieved from the database, based on the vehicle's seller property
	*  (function findSeller).
	* (4) Then the user associated with the seller is retrieved from the database, based on the seller's user property
	* (function findUser).
	*
	* The seller needs to be retrieved to display the seller's contact numbers and address. The user needs to be
	* retrieved, because the email address is necessary for the contact form.
	*
	* Error handling:
	* (1) If a vehicle's advertisement period has expired, and the user is not the owner, an error message should be
	* displayed.
	* (2) All errors are handled by the handleErrors function.
	*
	* @param {object} request An HTTP request object received from the express.get() method.
	* @param {object} response An HTTP response object received from the express.get() method.
	*
	* @returns {undefined}
	*/
	show: function (request, response) {
		var findUser = function (vehicle, seller, isOwnVehicle, callback) {
			User.findById(seller.user, function (err, user) {
				if (err) {
					return callback(err);
				}
				if (!user) {
					var error = new Error('A user with the requested id does not exist.');
					return callback(error);
				}
				return callback(null, vehicle, seller, user, isOwnVehicle);
			});
		};

		var findSeller = function (vehicle, isOwnVehicle, callback) {
			Seller.findById(vehicle.seller, function (err, seller) {
				if (err) {
					return callback(err);
				}
				if (!seller) {
					var error = new Error('A seller with the requested id does not exist.');
					return callback(error);
				}
				findUser(vehicle, seller, isOwnVehicle, callback);
			});
		};

		/**
		 * @summary Checks whether the user is authorized to view the vehicle profile.
		 *
		 * @description The user is authorized (var isAuthorized) if the following conditions are met:
		 * (1) The vehicle's advertisement period has not expired (var isExpired). OR
		 * (2) The logged-in seller is the owner of the vehicle (var isOwnVehicle).
		 *
		 * @param {object} vehicle The vehicle for which the profile is requested.
		 * @param {function} callback A callback function.
		 *
		 * @returns {undefined}
		 */
		var checkAuthorization = function (vehicle, callback) {
			var currentDate = new Date(Date.now());
			var isExpired = vehicle.expiryDate < currentDate;
			var isOwnVehicle = request.session.seller && request.session.seller._id == vehicle.seller;
			var isAuthorized = !isExpired || isOwnVehicle;

			if (!isAuthorized) {
				var error = new Error("The vehicle's advertisement period has expired.");
				return callback(error);
			}

			findSeller(vehicle, isOwnVehicle, callback);
		};

		var findVehicle = function (callback) {
			Vehicle.findById(request.params.vehicleId, function (err, vehicle) {
				if (err) {
					return callback(err);
				}
				if (!vehicle) {
					var error = new Error('A vehicle with the requested id does not exist.');
					return callback(error);
				}
				checkAuthorization(vehicle, callback);
			});
		};

		findVehicle(function (err, vehicle, seller, user, isOwnVehicle) {
			if (err) {
				handleErrors(err, request, response);
			} else {
				response.render('vehicle-profile-page', {
					vehicle: vehicle,
					seller: seller,
					user: user,
					dealerDisplay: seller.dealershipName === '' ? 'none' : '',
					privateSellerDisplay: seller.dealershipName === '' ? '' : 'none',
					emailFeedback: request.session.emailFeedback || {
						alertType: '',
						alertDisplay: 'none',
						message: ''
					},
					formActionsDisplay: isOwnVehicle ? '' : 'none',
					isLoggedIn: !!request.session.seller
				}, function (err, html) {
					if (err) {
						handleErrors(err, request, response);
					} else {
						request.session.emailFeedback = null;
						response.send(html);
					}
				});
			}
		});
	},
	/**
	 * @summary Responds to HTTP GET /vehicles/:vehicleId/edit. Displays views/vehicle-registration-form.ejs with the
	 * requested vehicle's details prefilled.
	 *
	 * @description Preconditions:
	 * (1) The seller must be logged-in (function isLoggedIn).
	 * (2) The vehicle must belong to the logged-in seller (function checkOwnership).
	 *
	 * Algorithm:
	 * (1) The vehicle (:vehicleId) is retrieved from the vehicles database collection (function findVehicle).
	 * (2) The id of the vehicle's seller is compared with the id of the logged-in user (function checkOwnership).
	 * (3) If the vehicle belongs to the logged-in seller, the edit form is displayed.
	 *
	 * Error handling:
	 * (1) Appropriate error messages are displayed under the following conditions:
	 * -- If the user is not logged-in.
	 * -- If a vehicle with the requested id does not exist.
	 * -- If the logged-in seller is not the owner of the vehicle.
	 * (2) All errors are handled by the handleErrors function.
	 *
	 * @param {object} request An HTTP request object received from the express.get() method.
	 * @param {object} response An HTTP response object received from the express.get() method.
	 *
	 * @returns	{undefined}
	 */
	showEditForm: function (request, response) {
		if (isLoggedIn('edit', request, response)) {
			var currentDate = new Date(Date.now());

			var checkOwnership = function (vehicle, callback) {
				if (vehicle.seller.toString() !== request.session.seller._id.toString()) {
					return callback(new Error('You can only edit your own vehicles.'));
				}
				getLookups(vehicle, callback);
			};

			var findVehicle = function (vehicleId, callback) {
				Vehicle.findById(vehicleId, function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					if (!vehicle) {
						return callback(new Error('A vehicle with the requested id does not exist.'));
					}
					checkOwnership(vehicle, callback);
				});
			};

			findVehicle(request.params.vehicleId, function (err, vehicle, makes, lookups) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.render('vehicle-registration-form', {
						action: '/vehicles/'.concat(vehicle._id.toString()).concat('/edit'),
						heading:  'Edit Vehicle',
						buttonCaption: 'Save Changes',
						vehicle: vehicle,
						makes: makes,
						manufacturersString: JSON.stringify(makes),
						colors: lookups[0].colors,
						fuels: lookups[0].fuels,
						transmissions: lookups[0].transmissions,
						thisYear: currentDate.getFullYear(),
						seller: request.session.seller,
						isLoggedIn: true
					});
				}
			});
		}
	},
	/**
	* @summary Responds to HTTP POST /vehicles/:vehicleId/edit. Edits the requested vehicle's profile, then displays it
	* (views/vehicle-profile-page.ejs).
	*
	* @description Preconditions:
	* (1) The seller must be logged-in (function isLoggedIn).
	* (2) The vehicle must belong to the logged-in seller (function checkOwnership).
	*
	* Error handling:
	* (1) Appropriate error messages are displayed under the following conditions:
	* -- If the user is not logged-in.
	* -- If a vehicle with the requested id does not exist.
	* -- If the logged-in seller is not the owner of the vehicle.
	* (2) All errors are handled by the handleErrors function.
	*
	* @param {object} request An HTTP request object received from the express.post() method.
	* @param {object} response An HTTP response object received from the express.post() method.
	*
	* @returns {undefined}
	*/
	edit: function (request, response) {
		if (isLoggedIn('edit', request, response)) {
			var frmVehicle = request.body.vehicle;

			var instantiateVehicle = function (callback) {
				Vehicle.findById(request.params.vehicleId, function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					if (!vehicle) {
						var error = new Error('No vehicle with that id exists.');
						return callback(err);
					}
					var updateVehicle = {
						_id: sanitize(frmVehicle._id),
						market: sanitize(frmVehicle.market),
						type: {
							make: sanitize(frmVehicle.type.make),
							model: sanitize(frmVehicle.type.model),
							year: sanitize(frmVehicle.type.year)
						},
						description: {
							mileage: sanitize(frmVehicle.description.mileage),
							color: sanitize(frmVehicle.description.color),
							fullServiceHistory: sanitize(frmVehicle.description.fullServiceHistory)
						},
						mechanics: {
							engineCapacity: sanitize(frmVehicle.mechanics.engineCapacity),
							fuel: sanitize(frmVehicle.mechanics.fuel),
							transmission: sanitize(frmVehicle.mechanics.transmission),
							absBrakes: sanitize(frmVehicle.absBrakes),
							powerSteering: sanitize(frmVehicle.mechanics.powerSteering)
						},
						luxuries: {
							airConditioning: sanitize(frmVehicle.luxuries.airConditioning),
							electricWindows: sanitize(frmVehicle.luxuries.electricWindows),
							radio: sanitize(frmVehicle.luxuries.radio),
							cdPlayer: sanitize(frmVehicle.luxuries.cdPlayer)
						},
						security: {
							alarm: sanitize(frmVehicle.security.alarm),
							centralLocking: sanitize(frmVehicle.security.centralLocking),
							immobilizer: sanitize(frmVehicle.security.immobilizer),
							gearLock: sanitize(frmVehicle.security.gearLock)
						},
						safety: {
							airBags: sanitize(frmVehicle.safety.airBags)
						},
						price: {
							value: sanitize(frmVehicle.price.value),
							negotiable: sanitize(frmVehicle.price.negotiable)
						},
						comments: sanitize(frmVehicle.comments),
						photos: vehicle.photos
					};

					checkDirectory(updateVehicle, request.files, callback);
				});
			};

			var updateVehicle = function (vehicle, callback) {
				delete vehicle._id;
				Vehicle.findByIdAndUpdate(frmVehicle._id, {
					$set: vehicle
				}, function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					return callback(null, vehicle);
				});
			};

			var editVehicle = function (callback) {
				instantiateVehicle(function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					updateVehicle(vehicle, callback);
				});
			};

			editVehicle(function (err, vehicle) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					response.redirect(302, '/vehicles/'.concat(vehicle._id.toString()).concat('/view'));
				}
			});
		}
	},
	/**
	* @summary Responds to HTTP GET /vehicles/:vehicleId/remove. Removes the vehicle's profile, then displays the
	* logged-in seller's list of vehicles.
	*
	* @description Preconditions:
	* (1) The seller must be logged-in (function isLoggedIn).
	* (2) The vehicle must belong to the logged-in seller (function checkOwnership).
	*
	* Postconditions:
	* (1) The vehicle's photos must also be deleted from the server.
	*
	* Algorithm:
	* (1) The vehicle (:vehicleId) is retrieved from the vehicles database collection (function findVehicle).
	* (2) The id of the vehicle's seller is compared with the id of the logged-in user (function checkOwnership).
	* (3) If the vehicle belongs to the logged-in seller, the vehicle's is deleted (function deleteVehicle).
	* (4) Then the vehicle's photos are deleted from the server (function deletePhotos).
	*
	* Error handling:
	* (1) Appropriate error messages are displayed under the following conditions:
	* -- If the user is not logged-in.
	* -- If a vehicle with the requested id does not exist.
	* -- If the logged-in seller is not the owner of the vehicle.
	* (2) All errors are handled by the handleErrors function.
	*
	* @param {object} request An HTTP request object received from the express.get() method.
	* @param {object} response An HTTP response object received from the express.get() method.
	*
	* @returns {undefined}
	*/
	remove: function (request, response) {
		if (isLoggedIn('remove', request, response)) {
			var deletePhotos = function (callback) {
				rimraf(path.join(__dirname, '..', 'uploads/img/vehicles', request.params.vehicleId.toString()),
						  function (err) {
					if (err) {
						return callback(err);
					}
					return callback(null);
				});
			};

			var deleteVehicle = function (vehicle, callback) {
				vehicle.remove(function (err) {
					if (err) {
						return callback(err);
					}
					deletePhotos(callback);
				});
			};

			var checkOwnership = function (vehicle, callback) {
				if (vehicle.seller.toString() !== request.session.seller._id.toString()) {
					var error = new Error('You can only delete your own vehicles.');
					return callback(error);
				}
				deleteVehicle(vehicle, callback);
			};

			var findVehicle = function (callback) {
				Vehicle.findById(request.params.vehicleId, function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					if (!vehicle) {
						var error = new Error('A vehicle with the requested id does not exist.');
						return callback(error);
					}
					checkOwnership(vehicle, callback);
				});
			};

			findVehicle(function (err) {
				if (err) {
					handleErrors(err, request, response);
				} else {
					request.session.vehicleDeleted = {
						message: 'The vehicle has been successfully deleted.',
						alertDisplay: ''
					};
					response.redirect(302, path.join('/sellers', request.session.seller._id, 'vehicles'));
				}
			});
		}
	},
	/**
	* @summary Responds to HTTP GET /vehicles/:vehicleId/photos/:photoId. Sends a photo to the browser.
	*
	* @param {object} request An HTTP request object received from the express.get() method.
	* @param {object} response An HTTP response object received from the express.get() method.
	*
	* @returns {undefined}
	*/
	sendPhoto: function (request, response) {
		response.sendfile(path.join(__dirname, '..', 'uploads/img/vehicles',
								request.params.vehicleId, request.params.photoId));
	},
	listSellerVehicles: function (request, response) {
		var seller;

		seller = request.session.seller;

		Vehicle.find({seller: seller._id}, function (err, vehicles) {
			if (err) {
				console.log(err);
				main.showErrorPage(request, response);
			} else {
				response.render('list-seller-vehicles-page', {
					vehicleDeleted: request.session.vehicleDeleted || {
						message: '',
						alertDisplay: 'none'
					},
					seller: request.session.seller,
					isLoggedIn: true,
					vehicles: vehicles
				}, function (err, html) {
					request.session.vehicleDeleted = null;
					if (err) {
						handleErrors(err, request, response);
					} else {
						response.send(html);
					}
				});
			}
		});
	}
};