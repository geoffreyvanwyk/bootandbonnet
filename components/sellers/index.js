/**
 * Import dependencies.
 */

var engine = require('ejs-locals');
var express = require('express');
var http = require('http');
var path = require('path');
var map = require('../../route-map');
var seller = require('./routes/sellers').seller;

/**
 * Configure application.
 */

var app = module.exports = express();

app.configure(function(){
    app.engine('ejs', engine);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

/**
 * Route requests.
 */

app.map = map;

app.map(app, {
    '/seller': {
	get: seller.read,
	post: seller.create,
	put: seller.update,
	'/new': {
	    get: seller.showNewForm
	},
	'/edit': {
	    get: seller.showEditForm
	}
    }
});