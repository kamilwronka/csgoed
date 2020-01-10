const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    required: true,
    type: String
  }
});

userSchema.pre("save", function(next) {
  const user = this;

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

const ModelClass = model("user", userSchema);

module.exports = ModelClass;
