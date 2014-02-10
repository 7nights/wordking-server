var 
  mongoose = require('mongoose'),
  Schema   = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var WDHSchema = new Schema({
  email: String,
  authorName: String,
  title: String,
  chapters: [{chapterId: ObjectId, mtime: Date}],
  modified: Date,
  created: Date
});

mongoose.model('WDH', WDHSchema);