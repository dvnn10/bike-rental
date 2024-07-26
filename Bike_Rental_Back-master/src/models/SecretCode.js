const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const secretCode = new Schema({
  email_username: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});
secretCode.set('timestamps', true);
module.exports.Code = mongoose.model('secretCode', secretCode);
