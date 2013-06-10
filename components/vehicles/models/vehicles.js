"use strict";

/**
 * For working with the vehicles database table
 */

var async = require('async');
var db = require("../../../database"); // For connecting to the database.
var modelPrototype = require('./models').model;
var photosPrototype = require('../../../models/photos').photos;

var vehiclePrototype = Object.defineProperties({}, {
/* Data properties */
	id: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	dateAdded: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	year: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	mileage: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	price: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	comments: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	engineCapacity: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	powerSteering: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	absBrakes: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	radio: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	cdPlayer: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	airConditioning: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	electricWindows: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	alarm: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	centralLocking: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	immobilizer: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	gearLock: {
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	airBags: {
		value: '',
		writable: true,
		enumerable: true,
		configurable: false
	},
	transmission: {
		value: '',
		writable: true,
		enumerable: true,
		configurable: false
	},
	color: {
		value: '',
		writable: true,
		enumerable: true,
		configurable: false
	},
	fuelType: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	seller: {
		value: {},
		writable: true,
		enumerable: true,
		configurable: false
	},
	model: {
		value: {},
		writable: true,
		enumerable: true,
		configurable: false
	},
	town: {
		value: {},
		writable: true,
		enumerable: true,
		configurable: false
	},
	photos: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
/* Methods */
	create: {
		value: function (callback) {
			var that = this;
			db.query("INSERT INTO vehicles SET ?", {
				year: that.year,
				mileage: that.mileage,
				price: that.price,
				comments: that.comments,
				engineCapacity: that.engineCapacity,
				powerSteering: that.powerSteering,
				absBrakes: that.absBreaks,
				radio: that.radio,
				cdPlayer: that.cdPlayer,
				airConditioning: that.airConditioning,
				electricWindows: that.electricWindows,
				alarm: that.alarm,
				centralLocking: that.centralLocking,
				immobilizer: that.immobilizer,
				gearLock: that.gearLock,
				airBags: that.airBags,
				transmission: that.transmission,
				color: that.color,
				fuelType: that.fuelType,
				sellerId: that.sellerId,
				modelId: that.modelId,
				townId: that.townId
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				that.id = result.insertId;
				return callback(null, that);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	read: {
		value: function (callback) {
			var that = this;
			that.readVehicle(function (err, vehicle) {
				if (err) {
					return callback(err);
				}
				that.readPhotos(function (err, vehicle) {
					if (err) {
						return callback(err);
					}
					that.readModel(function (err, vehicle) {
						if (err) {
							return callback(err);
						}
						return callback(null, vehicle);
					});
				});
			}); 
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	readVehicle: {
		value: function (callback) {
			var that = this;
			db.query('SELECT * FROM vehicles WHERE id = ?', that.id, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				if (rows.length === 0) {
					return callback(new Error('The vehicle does not exist.'));
				}
				that.dateAdded = rows[0].dateAdded;
				that.year = rows[0].year;
				that.mileage = rows[0].mileage;
				that.price = rows[0].price;
				that.comments = rows[0].comments;
				that.engineCapacity = rows[0].engineCapacity;
				that.powerSteering = rows[0].powerSteering;
				that.absBrakes = rows[0].absBrakes;
				that.radio = rows[0].radio;
				that.cdPlayer = rows[0].cdPlayer;
				that.airConditioning = rows[0].airConditioning;
				that.electricWindows = rows[0].electricWindows;
				that.alarm = rows[0].alarm;
				that.centralLocking = rows[0].centralLocking;
				that.immobilizer = rows[0].immobilizer;
				that.gearLock = rows[0].gearLock;
				that.airBags = rows[0].airBags;
				that.transmission = rows[0].transmission;
				that.color = rows[0].color;
				that.fuelType = rows[0].fuelType;
				that.seller.id = rows[0].sellerId;
				that.model.id = rows[0].modelId;
				that.town.id = rows[0].townId;
				return callback(null, that); 
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	readPhotos: {
		value: function (callback) {
			var that = this;
			var photos = Object.create(photosPrototype);
			photos.vehicleId = that.id;
			photos.readByVehicleId(function (err, photos) {
				if (err) {
					return callback(err);
				}
				that.photos = photos.all;
				return callback(null, that);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	readModel: {
		value: function (callback) {
			var that = this;
			var model = Object.create(modelPrototype);
			model.id = that.model.id;
			model.read(function (err, model) {
				if (err) {
					return callback(err);
				}
				that.model = model;
				return callback(null, that);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	update: {
		value: function (callback) {
			var that = this;
			db.query('UPDATE vehicles SET ? WHERE id = '.concat(db.escape(that.id)), {
				year: that.year,
				mileage: that.mileage,
				price: that.price,
				comments: that.comments,
				engineCapacity: that.engineCapacity,
				powerSteering: that.powerSteering,
				absBrakes: that.absBreaks,
				radio: that.radio,
				cdPlayer: that.cdPlayer,
				airConditioning: that.airConditioning,
				electricWindows: that.electricWindows,
				alarm: that.alarm,
				centralLocking: that.centralLocking,
				immobilizer: that.immobilizer,
				gearLock: that.gearLock,
				airBags: that.airBags,
				transmission: that.transmission,
				color: that.color,
				fuelType: that.fuelType,
				sellerId: that.sellerId,
				modelId: that.modelId,
				townId: that.townId
			}, function (err, result) {
				if (err) {
					return callback(err);
				}
				return callback(null, that);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	del: {
		value: function (callback) {
			var that = this;
			db.query('DELETE FROM vehicles WHERE id = ?', that.id, function (err, result) {
				if (err) {
					return callback(err);
				}
				return callback(null);
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	}
});

Object.preventExtensions(vehiclePrototype);

var vehiclesPrototype = Object.defineProperties({}, {
/* Data Properties */
	objects: {
		value: [],
		writable: true,
		enumerable: true,
		configurable: false
	},
/* Methods */
	readBy: {
		value: function (property, callback) {
			var that = this;
			db.query("SELECT * FROM vehicles WHERE ".concat(property.name).concat(" = ?"), property.value, function (err, rows, fields) {
				if (err) {
					return callback(err);
				}
				async.forEach(rows, function (row, callback1) {
					that.objects.push({
						id: row.id,
						year: row.year,
						mileage: row.mileage,
						price: row.price,
						comments: row.comments,
						engineCapacity: row.engineCapacity,
						powerSteering: row.powerSteering,
						absBrakes: row.absBreaks,
						radio: row.radio,
						cdPlayer: row.cdPlayer,
						airConditioning: row.airConditioning,
						electricWindows: row.electricWindows,
						alarm: row.alarm,
						centralLocking: row.centralLocking,
						immobilizer: row.immobilizer,
						gearLock: row.gearLock,
						airBags: row.airBags,
						transmission: row.transmission,
						color: row.color,
						fuelType: row.fuelType,
						seller: {
							id: row.sellerId
						},
						model: {
							id: row.modelId
						},
						town: {
							id: row.townId
						}
					});
					callback1();
				}, function () {
					async.forEach(that.objects, function (vehicleObject, callback2) {
						var vehicle = Object.create(vehiclePrototype);
						vehicleObject.readModel = vehicle.readModel;
						vehicleObject.readModel(function (err, vehicle) {
							if (err) {
								return callback(err);
							}
							callback2();
						});
					}, function () {
						return callback(null, that);
					});
				});	
			});
		},
		writable: true,
		enumerable: true,
		configurable: false
	}
});

Object.preventExtensions(vehiclesPrototype);

module.exports = {
	vehicle: vehiclePrototype,
	vehicles: vehiclesPrototype
};
