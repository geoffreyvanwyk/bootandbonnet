/**
 * For working with the locations database table.
 */

var async   = require('async');             // For working with asynchronous collection methods.
var db      = require('../database.js');    // For connecting to the database.

/**
 * Returns an array of strings containing the names of the provinces, 
 * e.g. ['Eastern Cape', 'Wester Cape', 'Northern Cape', 'Limpopo']. 
 */
var readProvinces = exports.readProvinces = function(callback) {
    db.query('SELECT DISTINCT province FROM locations', function (err, rows, fields) {
        if (err) {
            throw err;
        }
        else {
            var provinces = [];
            async.forEach(rows, function (row, callback1) {
                provinces.push(row.province);
                callback1();
            }, function() {
                callback(provinces);
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
exports.readAll = function (callback) {
    readProvinces(function(provinces) {
        locations = [];
        async.forEach(provinces, function (province, callback1) {
            locations.push({name: province, towns: []});
            db.query("SELECT id, town FROM locations WHERE province = ?", [province], function (err, rows, fields) {
                if (err) {
                    throw err;
                }
                else {
                    async.forEach(rows, function (row, callback2) {
                        locations[locations.length-1].towns.push({id: row.id, name: row.town});
                        callback2();
                    }, function () {
                        callback1();
                    });
                }
            });
        }, function () {
            callback(locations);
        });
    });
};