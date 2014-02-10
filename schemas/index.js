var mongoose = require('mongoose'),
    config   = require('../config');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error', config.db, err.message);
    process.exit(1);
  }
});

require('./user');
require('./WDH');
require('./WDC');
require('./userVerification');

exports.User = mongoose.model('User');
exports.WDH = mongoose.model('WDH');
exports.WDC = mongoose.model('WDC');
exports.UV = mongoose.model('UserVerification');