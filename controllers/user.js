/**
 * user 相关
 */

var User        = require('../models').User,
    config      = require('../config'),
    check       = require('validator').check,
    sanitize    = require('validator').sanitize,
    utils       = require('../lib/utils'),
    UV          = require('../models').UV,
    emailSender = require('../services/email');

function md5(str) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}

var REG_USERNAME = /^[a-zA-Z0-9\u4e00-\u9fa5\u0800-\u4e00]+[_.-]?[a-zA-Z0-9\u4e00-\u9fa5\u0800-\u4e00]+[_.-]?[a-zA-Z0-9\u4e00-\u9fa5\u0800-\u4e00]+$/;

/**
 * @param {String} req.body.name
 * @param {String} req.body.passwd
 * @param {String} req.body.repasswd
 * @param {String} req.body.emal
 */
exports.signUp = function (req, res, next) {
  // 验证邀请码
  if (req.body.invitationCode !== 'WTWK') return res.json({status: -1, message: '邀请码不正确', code: 'InvalidInvitationCode', data: 'Given: ' + req.body.invitationCode});

  if (!req.body.name || !req.body.passwd || !req.body.repasswd || !req.body.email) {
    return res.json({status: -1, message: '信息不完整'});
  }

  var name = sanitize(req.body.name).trim(),
  pass = sanitize(req.body.passwd).trim(),
  repass = sanitize(req.body.repasswd).trim(),
  email = sanitize(req.body.email).trim(),
  notEnoughInfo = false;

  if (pass === '') notEnoughInfo = true;
  if (pass !== repass) return res.json({status: -1, message: '两次输入的密码不一致'});
  name = sanitize(name).xss();
  pass = md5(sanitize(pass).xss());
  email = sanitize(email).xss().toLowerCase();

  if (name === '' || email === '') {
    return res.json({status: -1, message: '信息不完整'});
  }

  if (name.length < 5 || name.length > 30) {
    return res.json({status: -1, message: '用户名必须大于5个字符', code: 'NicknameLengthError'});
  }

  try {
    check(name).is(REG_USERNAME);
  } catch (e) {
    return res.json({status: -1, message: '用户名非法', code: 'InvalidNickname'});
  }

  try {
    check(email, '不正确的电子邮箱').isEmail();
  } catch (e) {
    return res.json({status: -1, message: e.message, code: 'InvalidEmail'});
  }

  User.getUsersByQuery({'$or': [{name: name}, {email: email}]}, {}, function (err, users) {
    if (err) return next(err);

    if (users.length > 0) {
      if (users[0].email == email && users[0].name == name) {
        UV.check(users[0], function (result, it) {
          console.log(result, it);
          if (result) emailSender.sendMail('signupcheck', {activateLink: config.activateLink + '/' + it.activateCode}, {to: users[0].email, subject: 'Please confirm your email'});
        });
      } else {
        console.log(users[0].email, email, users[0].name, name);
      }
      if (users[0].name === name) return res.json({status: -1, message: '用户名已被占用', code: 'NicknameAlreadyTaken'});
      return res.json({status: -1, message: '此邮箱已经注册过', code: 'EmailAlreadyRegistered'});
    }

    User.createUser(name, email, pass, function (err, u) {
      if (err) return next(err);

      var activateCode = utils.randomStr(8);

      UV.create(u, activateCode, function (err) {
        if (err instanceof Error) return res.json({status: -1, code: 'InternalError', message: 'Internal error.'});
        emailSender.sendMail('signupcheck', {activateLink: config.activateLink + '/' + activateCode}, {to: email, subject: 'Please confirm your email'});
      });

      res.json({status: 1, message: '创建成功', code: 'Success'});
    });
  });
};

exports.signIn = function (req, res, next) {
  if (!req.body.email || !req.body.passwd) {
    return res.json({status: -1, code: 'BadRequest'});
  }
  var name = sanitize(req.body.email).trim();
  name.indexOf('@') !== -1 && (name = name.toLowerCase());
  var passwd = md5(sanitize(req.body.passwd).trim());

  if (!name || !passwd) return res.json({status: -1, code: 'BadRequest'});

  User.getUsersByQuery({'$or': [{name: name}, {email: name}]}, {}, function (err, user) {
    if (err) return next(err);

    if (user.length === 0) return res.json({status: -1, message: '用户不存在', code: 'UserNotExists'});

    user = user[0];

    if (user.passwd !== passwd) return res.json({status: -1, message: '密码错误', code: 'WrongPassword'});

    // activated check
    UV.check(user, function (found) {
      if (found) return res.json({status: -1, code: 'AccountNotActivated', message: '账号未激活'});

      req.session.user = user;

      res.json({status: 1, message: '登录成功', code: 'Success', data: {
        id: user._id,
        name: user.name,
        email: user.email,
        _csrf: req.session._csrf
      }});
    });

  });
};

exports.signOut = function (req, res, next) {
  if ((req.params._csrf || req.body._csrf) !== req.session._csrf) {
    return res.redirect("/signIn");
  }
  req.session.destroy();
  res.clearCookie('userinfo');
  res.redirect("/");
};

exports.activateAccount = function (req, res, next) {
  var code = req.params.activateCode;
  if (!code) return res.json({status: -1, code: 'BadRequest'});

  UV.activate(code, function (result) {
    if (result) return res.send('Account activated!');
    else return res.send('Invalid activated code.');
  });
};