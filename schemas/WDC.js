var 
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var WDCSchema = new Schema({
  WDHId: {type: ObjectId, index: true},
  name: String,
  created: Date,
  content: String
});

mongoose.model('WDC', WDCSchema);