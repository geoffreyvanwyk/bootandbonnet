
/**
 * Import dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , engine = require('ejs-locals');


/**
 * Configure application.
 */

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.engine('ejs', engine);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('xvrT4521ghqw0'));
  app.use(express.cookieSession());
  app.use(app.router);
  app.use('/public', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
 * Route requests.
 */

var home = require('./routes/home'),
    users = require('./routes/users'),
    sellers = require('./routes/sellers');

app.get('/', home.index);
app.get('/new-seller', sellers.showSellerForm);
app.post('/seller', sellers.create);

/**
 * Start web server.
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
