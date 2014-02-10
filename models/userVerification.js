var UV = require('../schemas').UV;

/**
 * create an verification
 */
exports.create = function (user, activateCode, callback) {
  // check if there is a pending activation
  UV.findOne({userId: user._id}, function (err, it) {
    if (it) {
      // activation expired
      if (Date.now() - it.date >= 1000 * 60 * 60 * 24) {
        it.remove();
      } else {
        return callback(new Error('PendingActivation'));
      }
    }

    var uv = new UV;
    uv.userId = user._id;
    uv.date = new Date;
    uv.activateCode = activateCode;
    uv.save(callback);
  });
};

exports.check = function (user, callback) {
  UV.findOne({userId: user._id}, function (err, it) {
    return callback(!!it, it);
  });
};

exports.activate = function (activateCode, callback) {
  UV.findOne({activateCode: activateCode}, function (err, it) {
    if (!it) return callback(false);

    it.remove();
    callback(true);
  });
};
