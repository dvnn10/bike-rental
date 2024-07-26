const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    max: 100,
  },
  lastName: {
    type: String,
    required: true,
    max: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contactNumber: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'manager'],
    default: 'user',
    max: 10,
  },
  status: {
    type: String,
    default: 'inactive',
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
  },
});
UserSchema.set('timestamps', true);
module.exports = User = mongoose.model('user', UserSchema);
