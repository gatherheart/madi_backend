import * as mongoose from "mongoose";
import * as crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  username: {
    type: String,
    trim: true,
    required: "UserName is required",
  },
  roles: {
    type: Array,
    required: "Roles are required",
  },
  provider: {
    type: String,
    required: "",
  },
  kakao: {
    type: JSON,
  },

  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  seller: {
    type: Boolean,
    default: false,
  },
  stripe_seller: {},
  stripe_customer: {},
});

UserSchema.methods = {
  authenticate: function (plainText: any) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password: crypto.BinaryLike) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

export default mongoose.model("User", UserSchema);
