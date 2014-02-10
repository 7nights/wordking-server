var 
  user = require('./controllers/user'),
  WDH = require('./controllers/WDH'),
  WDC = require('./controllers/WDC'),
  upload = require('./middlewares/upload'),
  auth = require('./middlewares/auth').userRequired,
  authCsrf = require('./middlewares/auth').csrf,
  utils = require('./lib/utils');

module.exports = function (app) {
  app.post('/signUp', user.signUp);
  app.post('/signIn', user.signIn);
  app.get('/activate/:activateCode', user.activateAccount);
};
