import * as mongoose from "mongoose";
import * as crypto from "crypto";

interface IUserSchema extends mongoose.Document {
  authenticate(password: any): boolean;
  name: string;
  provider: string;
  facebookId: string;
  email: String;
  updated?: string;
  created: string;
  refreshToken: string;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
  },
  provider: {
    type: String,
    required: "",
  },
  email: {
    type: String,
  },
  hashed_password: {
    type: String,
    required: "Password is required"
  },
  facebookId: { type: String },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
    required: "required token",
  },
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

export default mongoose.model<IUserSchema>("User", UserSchema);
