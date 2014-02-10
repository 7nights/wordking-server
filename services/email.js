var config         = require('../config'),
    path           = require('path'),
    templatesDir   = path.join(__dirname, config.emailTemplatesDir),
    emailTemplates = require('email-templates'),
    nodemailer     = require('nodemailer');

emailTemplates(templatesDir, function (err, template) {
  if (err) {
    throw err;
  }

  var transport = nodemailer.createTransport('SMTP', {
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    }
  });

  /**
   * @param {String} [email.from]
   * @param {String} email.to
   * @param {String} email.subject
   */
  exports.sendMail = function (templateName, locals, email, callback) {
    template(templateName, locals, function (err, html, text) {
      if (err) throw err;
      transport.sendMail({
        from: email.from || config.emailDefaultAddress,
        to: email.to,
        subject: email.subject,
        html: html,
        text: text
      }, function (err, responseStatus) {
        if (err) throw err;
        typeof callback === 'function' && callback(responseStatus);
      });
    });
  };
});