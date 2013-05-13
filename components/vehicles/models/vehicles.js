"use strict";

/**
 * For working with the vehicles database table
 */

 var db = require("../../../database"); // For connecting to the database.

 var vehicle = Object.defineProperties({}, {
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
		value: false,
		writable: true,
		enumerable: true,
		configurable: false
	},
	transmission: {
		value: "",
		writable: true,
		enumerable: true,
		configurable: false
	},
	color: {
		value: "",
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
	sellerId: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	modelId: {
		value: 0,
		writable: true,
		enumerable: true,
		configurable: false
	},
	townId: {
		value: 0,
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
				that.sellerId = rows[0].sellerId;
				that.modelId = rows[0].modelId;
				that.townId = rows[0].townId;
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

Object.preventExtensions(vehicle);

var vehicles = Object.defineProperties({}, {
	/* Methods */
	create: {
		value: function (callback) {
			var that = this;
			
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	read: {
		value: function (callback) {
			var that = this;
			
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	update: {
		value: function (callback) {
			var that = this;
			
		},
		writable: true,
		enumerable: true,
		configurable: false
	},
	del: {
		value: function (callback) {
			var that = this;
			
		},
		writable: true,
		enumerable: true,
		configurable: false
	}
});

Object.preventExtensions(vehicles);

module.exports = {
	vehicle: vehicle,
	vehicles: vehicles
};
