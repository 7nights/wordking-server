var WDH = require('../schemas').WDH,
    WDC = require('../schemas').WDC;

/**
 * create an chapter and insert it to a WDH
 * @param {Number} index the position to insert; -1 stands for the last of the list
 * @errors Error('NotFound'), Error('InvalidIndex')
 */
exports.createAndInsert = function (WDHId, index, name, content, callback) {
  WDH.findOne({_id: WDHId}, function (err, wdh) {
    if (err) return callback(err);

    if (!it) return callback(new Error('NotFound'));
    if (index < -1) return callback(new Error('InvalidIndex'));
    var wdc = new WDC;
    wdc.WDHId = WDHId;
    wdc.name = name;
    wdc.content = content;
    wdc.created = new Date;
    wdc.save(function (err, wdc) {
      if (err) return callback(err);
      if (index === -1) index = wdh.chapters.length;
      wdh.chapters.splice(index, 0, {
        chapterId: wdc._id,
        mtime: new Date
      });
      wdh.save(callback);
    });
  });

};

exports.getById = function (WDCId, callback) {
  WDC.findOne({_id: WDCId}, callback);
};

/**
 * @errors Error('NotFound')
 */
exports.update = function (WDCId, name, content, callback) {
  exports.getById(WDCId, function (err, wdc) {
    if (!wdc) return callback(new Error('NotFound'));
    if (name) wdc.name = name;
    if (content) wdc.content = content;

    wdc.save(callback);
  });
};

exports.removeById = function (WDCId, callback) {
  wdc.remove(WDCId, callback);
};

exports.deleteChapters = function (chapters, callback) {
  var conditions = {'$or': []};

  chapters.forEach(function (val) {
    conditions.$or.push({_id: val});
  });

  WDC.remove(conditions, callback);
};