const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const { Schema, model } = mongoose;

const ServerSchema = require("../servers/servers.model");

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    required: true,
    type: String
  },
  activateToken: {
    type: String
  },
  activated: {
    type: Boolean,
    required: true
  },
  resendActivationMailTime: {
    type: Number
  },
  payments: {
    balance: { type: Number, default: 0 },
    currency: String,
    history: []
  },
  loginIPAddresses: { type: Array },
  servers: [ServerSchema]
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

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

const ModelClass = model("user", userSchema);

module.exports = ModelClass;
