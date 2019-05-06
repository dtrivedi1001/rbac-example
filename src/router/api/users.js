const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const RBAC = require("express-rbac");

// Load User Model
const User = require("../../model/User");
const ROLES = require("../../model/User");

const domain_regex = new RegExp("(?<=@)[^.]+.*$");

// @route           GET api/users/test
// @description     Tests user route
// @access          Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users Works"
  })
);

// @route           GET api/users/register
// @description     Register user
// @access          Public
router.post("/register", (req, res) => {
  // detect domain of the registration email
  const r = req.body.email.match(domain_regex);
  let domain = req.body.email;
  let role = User.role;
  let permission = User.permissionRight;
  if (r) {
    domain = r[0];
  }
  console.log(ROLES);
  console.log(ROLES.ADMIN);
  console.log("Before IF DOMAIN");
  console.log(permission);

  User.findOne({ domain: domain }).then(domain_user => {
    if (!domain_user) {
      role = "ADMIN";
      permission = [
        "canRead",
        "canCreate",
        "canUpdate",
        "canDelete",
        "canAddUser",
        "canEditUser",
        "canViewUser",
        "canDeleteUser"
      ];
    }
  });
  console.log("After IF DOMAIN");
  console.log(permission);
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      //errors.email = "Email already exists";
      return res.status(400).json({ err: "Email already exists" });
    } else {
      console.log("INSIDE EMAIL Exists");
      console.log(role);
      console.log(permission);
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", // Rating
        d: "mm" // Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
        domain: domain,
        role: role,
        permissionRight: permission
      });

      console.log(newUser);

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(newUser))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route           GET api/users/login
// @description     Login User / Returning JWT(JSON Web Token) Token
// @access          Public
router.post("/login", (req, res) => {
  // Find  user by email
  User.findOne({ email: req.body.email }).then(user => {
    // Check for User
    if (!user) {
      // errors.email = "User not found";
      return res.status(400).json({ err: "User not found" });
    }

    // Check password
    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        //res.json({ msg: 'success' });
        // User Matched
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }; 
        // Create the Payload
        // Sign The Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        //errors.password = "Password incorrect";
        return res.status(400).json({ err: "Password incorrect" });
      }
    });
  });
});

// @route           GET api/users/current
// @description     Return current user
// @access          Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
