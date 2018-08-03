const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const User = require("../models/user");
const isAuthenticated = require("../utils/is-authenticated");
const router = express.Router();
const saltRounds = 10;
const jwtSecret = "secret";
//signup
router.post("/signup", async function(req, res, next) {
  try {
    const { name, password, email, phone, college, code } = req.body;
    const user = await User.findOne({ email })
      .select("email")
      .lean();
    if (user) {
      return res.json({ message: "This email is already taken" });
      //todo: check for phone also
    }
    const pwdHash = await bcrypt.hash(password, saltRounds);
    const userData = {
      name,
      email,
      phone,
      college,
      password: pwdHash,
      referralCode: shortid.generate()
    };
    if (code) {
      const isValidCode = await User.findOne({ referralCode: code })
        .select("refferalCode")
        .lean();
      if (!isValidCode) {
        return res.json({ message: "Invalid refferal code" });
      } else {
        userData.referredBy = { code };
      }
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();
    //login the user now
    const token = jwt.sign({ id: savedUser._id }, jwtSecret);
    res.cookie("user", token, { domain: "localhost:3000", httpOnly: true });
    res.json({ token, message: "user created" });
  } catch (err) {
    next(err);
  }
});

//signin
router.post("/signin", async function(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) return res.json({ message: "Incorrect details" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Incorrect details" });
    //login the user now
    const token = jwt.sign({ id: user._id }, jwtSecret);
    res.cookie("user", token, { domain: "localhost:3000", httpOnly: true });
    res.json({ token, message: "login successful" });
  } catch (err) {
    next(err);
  }
});
//get userprofile
router.get("/profile", isAuthenticated, async function(req, res, next) {
  try {
    const userid = req.decoded.id;
    const projection = {
      name: 1,
      email: 1,
      phone: 1,
      college: 1
    };
    const user = await User.findOne({ _id: userid }, projection);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

//check if a referral code is valid
router.get("/referral/:code", async function(req, res, next) {
  try {
    const { code } = req.params;
    const user = User.findOne({ referralCode: code })
      .select("referralCode")
      .lean();
    if (user) {
      return res.json({ success: true, message: "Referral code applied" });
    }
    return res.json({ success: false, message: "Invalid referral code" });
  } catch (err) {
    next(err);
  }
});
//get referrals of a user
router.get("/referrals", isAuthenticated, async function(req, res) {
  try {
    const userId = req.decoded.id;
    const user = await User.findById(userId);
    const projection = {
      name: 1,
      email: 1,
      referredBy: 1
    };
    const referredUsers = User.find({
      "referredBy.code": user.referralCode
    }).lean();
    res.json({ referredUsers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
