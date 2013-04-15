"use strict";

var async = require('async');
var db = require('../../../database');

var manufacturers = {
	readNames: function(callback) {
		var names = [];
		db.query('SELECT name FROM manufacturers', function(err, rows, fields) {
			if (err) {
				return callback(err);
			}
			async.forEach(rows, function(row, callback1) {
				names.push(row.name);
				return callback1();
			}, function() {
				return callback(null, names);
			});
		});
	},
	readModels: function(callback) {
		var manufacturerObjects = [];
		manufacturers.readNames(function(err, manufacturerNames) {
			if (err) {
				return callback(err);
			}
			async.forEach(manufacturerNames, function(manufacturerName, callback1) {
				manufacturerObjects.push({
					name: manufacturerName,
					models: []
				});
				return callback1();
			}, function() {
				async.forEach(manufacturerObjects, function(manufacturerObject, callback2) {
					db.query('SELECT models.id, models.name\
								FROM models\
								INNER JOIN manufacturers\
								WHERE manufacturers.name = ? AND\
								manufacturers.id = models.manufacturer_id', [manufacturerObject.name],
						function(err, rows, fields) {
							if (err) {
								return callback(err);
							}
							async.forEach(rows, function(row, callback3) {
								manufacturerObject.models.push({
									id: row.id,
									name: row.name
								});
								return callback3();
							}, function() {
								return callback2();
							});
						});
				}, function() {
					return callback(null, manufacturerObjects);
				});
			});
		});
	}
};

if (require.main === module) {
	manufacturers.readNames(function(err, names) {
		if (err) {
			throw err;
		} else {
			console.log(names);
		}
	});
}

module.exports.manufacturers = manufacturers;