var User = require('../schemas').User,
    WDH  = require('../schemas').WDH;

/**
 * create a WDH
 */
exports.create = function (email, authorName, title, callback) {
  var wdh = new WDH;
  wdh.email = email;
  wdh.authorName = authorName;
  wdh.chapters = [];
  wdh.modified = wdh.created = new Date;
  wdh.save(callback);
};

/**
 * get an WDH by id
 */
exports.getById = function (id, callback) {
  WDH.findOne({_id: id}, callback);
};

/**
 * get WDHs by user email
 * @param {String} email
 * @param {Number} page the start page of results, start from 0
 * @param {Number} size the number of items in each page
 */
exports.getWDHsByEmail = function (email, opt, page, size, callback) {
  !page && (page = 0);
  !size && (size = 10);
  WDH.find({
    'email': email,
  }, null, opt).sort({modified: -1}).skip(page * size).limit(size).exec(callback);
};

exports.getWDHsByQuery = function (query, opt, callback) {
  WDH.find(query, {}, opt, callback);
};

/**
 * get WDHs by author author
 */
exports.getWDHsByAuthor = function (name, opt, page, size, callback) {
  !page && (page = 0);
  !size && (size = 10);
  WDH.find({
    'authorName': name,
  }, null, opt).skip(page * size).limit(size).exec(callback);
};

exports.countWDHsByEmail = function (email, callback) {
  WDH.count({email: email}, callback);
};
exports.countWDHsByAuthor = function (name, callback) {
  WDH.count({authorName: name}, callback);
};

exports.removeById = function (id, callback) {
  WDH.remove({_id: id}, callback);
};
