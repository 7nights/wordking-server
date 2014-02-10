var 
  path    = require('path'),
  express = require('express'),
  config  = require('./config'),
  routes  = require('./routes'),
  utils   = require('./lib/utils');

config.uploadDir = config.uploadDir || path.join(__dirname, 'public', 'user_data', 'images');
utils.mkdirp(config.uploadDir);

var app = express();

app.configure(function () {
  app.use(express.bodyParser({
    uploadDir: config.uploadDir
  }));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.sessionSecret
  }));

  app.use('/user_data', express.static(path.join(__dirname, 'public', 'user_data'), {
    maxAge: 0
  }));

  app.use(express.compress());

  // routes
  routes(app);

  app.use('/', express.static(path.join(__dirname, 'public')));
  app.configure('production', function () {
    app.use(express.errorHandler());
  });

  app.listen(config.port);
  module.exports = app;
});

