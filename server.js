const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const RBAC = require("express-rbac");

const users = require("./src/router/api/users");

const app = express();

// Body parser middlewear
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./src/config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// passport Middlewaer
app.use(passport.initialize());

// passport Config
require("./src/config/passport")(passport);

// Use Routes
app.use("/api/users", users);
//app.use("/api/profile", profile);
//app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
