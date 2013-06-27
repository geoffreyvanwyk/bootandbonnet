var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bootandbonnet');
mongoose.connection.on('error', console.error.bind(console, 'Failed to connect to MongoDB.'));
mongoose.connection.once('open', function () {
	console.log('Successfully connected with MongoDB.');
});
module.exports = {
	mongoose: mongoose
};