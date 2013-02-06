var async = require('async');
var db = require('../database.js');

var read = exports.read = function (callback) {
    db.query('SELECT DISTINCT province FROM locations', function (err1, locations, fields1) {
        var provinces = [];
        async.forEach(locations, function (location, callback1) {
            provinces.push(location.province);
            db.query("SELECT id, town FROM locations WHERE province = ? LIMIT 10", [location.province], function (err2, towns, fields2) {
                if (err2) {
                    throw err2;
                }
                else {
                    location.towns = [];
                    async.forEach(towns, function (town, callback2) {
                        location.towns.push(town);
                        callback2();
                    }, function () {
                        callback1();
                    });
                }
            });
        }, function () {
            callback(provinces, locations);
        });
    });
};