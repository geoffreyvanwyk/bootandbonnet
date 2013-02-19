/**
 * For working with the locations database table.
 */

var async   = require('async');             // For working with asynchronous collection methods.
var db      = require('../database.js');    // For connecting to the database.

/**
 * Returns an array of strings containing the names of the provinces, 
 * e.g. ['Eastern Cape', 'Western Cape', 'Northern Cape', 'Limpopo']. 
 */
var readProvinceNames = exports.readProvinceNames = function(callback) {
    db.query('SELECT DISTINCT province FROM locations', function (err, rows, fields) {
	if (err) {
	    throw err;
	} else {
	    var provinceNames = [];
	    async.forEach(rows, function (row, callback1) {
		provinceNames.push(row.province);
		callback1();
	    }, function() {
		callback(provinceNames);
	    });
	}
        
    });
};

/**
 * Returns an array of province objects. An example of a province object is:
 * {
 *   name: 'Eastern Cape',
 *   towns: [
 *           {
 *               name: 'Port Elizabeth',
 *               id: 1023
 *           },
 *           {
 *               name: 'East London',
 *               id: 34
 *           }
 *          ]
 *  }
 */
var readProvinceObjects = exports.readProvinceObjects = function(callback) {
    provinceObjects = [];
    readProvinceNames(function (provinceNames) {
	async.forEach(provinceNames, function (provinceName, callback1) {
	    provinceObjects.push({
		name: provinceName, 
		towns: []
	    });
	    callback1();
	}, function () {
	    async.forEach(provinceObjects, function (provinceObject, callback2) {
		db.query("SELECT id, town FROM locations WHERE province = ?", provinceObject.name, function (err, rows, fields) {
		    if (err) {
			throw err;
		    }
		    else {
			async.forEach(rows, function (row, callback3) {
			    provinceObject.towns.push({
				id: row.id, 
				name: row.town
			    });
			    callback3();
			}, function () {
			    callback2();
			});
		    }
		});	
	    }, function () {
		callback(provinceObjects);
	    });
	});
    });
}