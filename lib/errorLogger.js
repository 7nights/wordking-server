var config;

var path = require('path'),
    fs = require('fs');

exports.config = function (obj) {
  config = obj;
};

exports.log = function (type, msg) {
  fs.appendFile(path.join(config.errorLogPath || './', config.errorLogFileName || 'errors.log'), '[' + type + ']' + ' ' + msg + '\n', function () {});
};