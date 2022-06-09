const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  nickname: { type: String, unique: true },
  hash: String,
  salt: String,
});

mongoose.model('User', UserSchema);
