var User = require('../schemas').User;

/**
 * create a user
 */
exports.createUser = function (name, email, passwd, callback) {
  var user = new User;
  user.name = name;
  user.email = email;
  user.passwd = passwd;
  user.created = user.lastSignIn = new Date;
  user.save(callback);
};

/**
 * get a user by email address
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 * get a user by id
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

/**
 * get a user by name
 */
exports.getUserByName = function (name, callback) {
  User.findOne({name: name}, callback);
};

/**
 * get users by query
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, {}, opt, callback);
};