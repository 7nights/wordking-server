var
  mongoose = require('mongoose'),
  Schema  = mongoose.Schema,
  config  = require('../config');

var UserSchema = new Schema({
  name: {type: String, unique: true},
  email: {type: String, unique: true},
  passwd: {type: String},
  created: {type: Date},
  lastSignIn: {type: Date}
});

mongoose.model('User', UserSchema);