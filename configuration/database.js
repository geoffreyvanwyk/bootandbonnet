var mongoose = require('mongoose');

var mongodb = {
	connect: function () {
		mongoose.connect('mongodb://localhost/bootandbonnet');
		mongoose.connection.on('error', 
							   console.error.bind(console, 'Failed to connect to MongoDB.'));
		mongoose.connection.once('open', function () {
			console.log('Successfully connected with MongoDB.');
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