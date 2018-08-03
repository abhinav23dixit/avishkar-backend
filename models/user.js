const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  referralCode: { type: String, required: true },
  referredBy: { code: { type: String }, status: { type: Number, default: 0 } }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
