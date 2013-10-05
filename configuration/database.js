var mongoose = require('mongoose');

var mongodb = {
	connect: function () {
		mongoose.connect('mongodb://localhost/bootandbonnet');
		mongoose.connection.on('error',
							   console.error.bind(console, 'Failed to connect to database server.'));
		mongoose.connection.once('open', function () {
			console.log('Database server listening on port 27017.');
		});
	}
};

var mysql = require('mysql').createConnection({
        host: 'localhost',
        user: 'root',
        password: '@wesomegEn1us',
        database: 'bootandbonnet'
});

module.exports = {
	mongodb: mongodb,
	mysql: mysql
};