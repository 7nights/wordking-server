var
  mongoose = require('mongoose'),
  Schema  = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  config  = require('../config');

var UserVerificationSchema = new Schema({
  userId: {type: ObjectId, unique: true},
  date: Date,
  activateCode: String
});

mongoose.model('UserVerification', UserVerificationSchema);