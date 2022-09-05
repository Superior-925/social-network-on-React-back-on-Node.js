const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  nickname: { type: String, unique: true },
  avatar: { type: Boolean, default: false },
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hash: String,
  salt: String,
});

mongoose.model('User', UserSchema);
