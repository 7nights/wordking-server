var
  WDH         = require('../models').WDH,
  WDC         = require('../models').WDC,
  errorLogger = require('../lib/errorLogger'),
  sanitize    = require('validator').sanitize;

/**
 * 创建一个WDC并把他插入一个WDH
 * @param {String} req.name
 * @param {String} req.content
 * @param {ObjectId} req.WDHId
 * @param {Number} req.index
 */
exports.createAndInsert = function (req, res, next) {
  if (!req.body.WDHId || !req.body.name || !req.body.content) return res.json({status: -1, code: 'BadRequest'});

  var name = sanitize(req.body.name.trim()).xss().substr(0, 100),
  content = sanitize(req.body.content.trim()).xss(),
  index = parseInt(req.body.index) || -1;

  WDH.getById(req.body.WDHId, function (err, wdh) {
    if (err) return next(err);

    if (!wdh) return res.json({status: -1, message: 'WDH not found.', code: 'NotExists'});

    WDC.createAndInsert(req.body.WDHId, index, name, content, function (err, wdc) {
      if (err) return next(err);

      return res.json({status: 1, data: {wdcId: wdc._id}});
    });
  });
};

/**
 * 修改一个chapter
 */
exports.update = function (req, res, next) {
  if (!req.body.WDCId) return res.json({status: -1, code: 'BadRequest'});

  WDC.getById(req.body.WDCId, function (err, wdc) {
    if (err) return next(err);

    if (!wdc) return res.json({status: -1, code: 'NotExists', message: 'WDC not found.'});
    var title, content;
    req.body.title && (title = sanitize(req.body.title.trim()).xss().substr(0, 100));
    req.body.content && (content = sanitize(req.body.content.trim()).xss());

    title && (wdc.title = title);
    content && (wdc.content = content);

    if (title || content) {
      wdc.save();
      WDH.getById(wdc.WDHId, function (err, wdh) {
        if (err) return next(err);

        if (!wdh) {
          errorLogger.log('UnexceptedError', '尝试修改的WDC对应的WDH不存在');
          return res.json({status: -1, code: 'InternalError', message: 'Internal Error'});
        }

        for (var i = wdh.chapters.length; i--; ) {
          if (wdh.chapters[i].chapterId === wdc._id) {
            wdh.chapters[i].mtime = new Date;
            wdh.save();
            break;
          }
        }

        return res.json({status: 1});
      });
    } else {
      return res.json({status: 0});
    }
  });
};

/**
 * 删除一个chapter
 */
exports.remove = function (req, res, next) {
  if (!req.body.WDCId) return res.json({status: -1, code: 'BadRequest'});

  WDC.getById(req.body.WDCId, function (err, wdc) {
    if (err) return next(err);

    if (!wdc) return res.json({status: 0});
    WDH.getById(wdc.WDHId, function (err, wdh) {
      if (err) return next(err);

      if (!wdh) {
        errorLogger.log('UnexceptedError', '尝试修改的WDC对应的WDH不存在');
        return res.json({status: -1, code: 'InternalError', message: 'Internal Error'});
      }

      for (var i = wdh.chapters.length; i--; ) {
        if (wdh.chapters[i].chapterId === wdc._id) {
          wdh.chapters.splice(i, 1);
          wdh.save();
          break;
        }
      }
      wdc.remove();

      return res.json({status: 1});
    });
  });

};