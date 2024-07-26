const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = Schema({
  fieldname: {
    type: String,
    max: 100,
  },
  originalname: {
    type: String,
  },
  encoding: {
    type: String,
  },
  mimetype: {
    type: String,
  },
  destination: {
    type: String,
  },
  filename: {
    type: String,
  },
  path: {
    type: String,
  },
  size: {
    type: String,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
});

MediaSchema.set('timestamps', true);
module.exports = Media = mongoose.model('media', MediaSchema);
