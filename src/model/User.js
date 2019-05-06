const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ROLES = ["USER", "STAFF", "ADMIN", "CLIENT", "PARTNER"];

const PERMISSION = [
  "canRead",
  "canCreate",
  "canUpdate",
  "canDelete",
  "canAddUser",
  "canEditUser",
  "canViewUser",
  "canDeleteUser"
];

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ROLES,
    default: "USER"
  },
  permissionRight: {
    type: [String],
    enum: PERMISSION,
    require: true,
    default: ["canRead"]
  }
});

module.exports = User = mongoose.model("users", UserSchema);
