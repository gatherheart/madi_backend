"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const crypto = require("crypto");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Name is required",
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
    email: {
        type: String,
        trim: true,
        unique: "Email already exists",
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
        required: "Email is required",
    },
    hashed_password: {
        type: String,
        required: "Password is required",
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
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function (password) {
        if (!password)
            return "";
        try {
            return crypto
                .createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        }
        catch (err) {
            return "";
        }
    },
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + "";
    },
};
exports.default = mongoose.model("User", UserSchema);
//# sourceMappingURL=user.model.js.map