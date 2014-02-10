var 
  WDH      = require('../models').WDH,
  WDC      = require('../models').WDC,
  utils    = require('../lib/utils'),
  sanitize = require('validator').sanitize,
  User     = require('../models').User;

exports.create = function (req, res, next) {
  if (!req.body.title) {
    return res.json({status: -1, code: 'BadRequest'});
  }
  var title = sanitize(req.body.title.trim()).xss().substr(0, 60);
  var user = req.session.user;
  WDH.create(user.email, user.name, title, function (err, wdh) {
    if (err) return next(err);

    return res.json({status: 1, code: 'Success', data: {id: wdh._id}});
  });
};

exports.remove = function (req, res, next) {
  if (!req.body.id) {
    return res.json({status: -1, code: 'BadRequest'});
  }
  WDH.getById(req.body.id.toString(), function (err, wdh) {
    if (err) return next(err);

    if (!wdh) return res.json({status: 0});
    
    if (wdh.email !== req.session.user.email) return res.json({status: -1, code: 'PermissionDenied'});
    wdh.remove(function (err) {
      if (err) return next(err);

      return res.json({status: 1});
    });
  });
};

exports.getListByUser = function (req, res, next) {
  if (!req.body.user || req.body.page === undefined || req.body.size === undefined) {
    return res.json({status: -1, code: 'BadRequest'});
  }
  if (req.body.user.indexOf('@') !== -1) {
    WDH.getWDHsByEmail(req.body.user, null, parseInt(req.body.page) || 0, parseInt(req.body.size) || 0, function (err, list) {
      var result = [];
      for (var i = 0, length = list.length; i < length; i++) {
        var obj = {};
        utils.fillObject(list[i], obj, ['_id', 'chapters', 'modified', 'created']);
        result.push(obj);
      }
      res.json(result);
    });
  }
};

/**
 * 更新一个WDH
 * @param {String} req.title
 * @param {Array} req.chapters 一个对应章节Id的数组
 */
exports.update = function (req, res, next) {
  if (!req.body.id) {
    return res.json({status: -1, code: 'BadRequest'});
  }

  WDH.getById(req.body.id, function (err, wdh) {
    if (err) return next(err);

    if (wdh.email !== req.session.user.email) return res.json({status: -1, code: 'PermissionDenied', message:' 权限不足'});

    if (req.body.title) {
      wdh.title = sanitize(req.body.title.trim()).xss().substr(0, 60);
    }
    if (req.body.chapters && req.body.chapters.constructor === Array) {
      var oldChapters = wdh.chapters,
          newChapters = req.body.chapters;
      var deleted = [],
          newMap = {},
          oldMap = {};
      newChapters.forEach(function (val) {
        newMap[val] = true;
      });
      oldChapters.forEach(function (val) {
        if (!(val.chapterId in newMap)) deleted.push(val.chapterId);
        else oldMap[val.chapterId] = val.mtime;
      });
      newMap = null;
      WDC.deleteChapters(deleted);
      // 重新获取更新时间
      var result = [];
      for (var i = 0, length = newChapters.length; i < length; i++) {
        result.push({chapterId: newChapters[i], mtime: oldMap[newChapters[i]]});
      }
      wdh.chapters = result;
      wdh.save(function (err) {
        if (err) return next(err);

        return res.json({status: 1});
      });
    }
  });
};