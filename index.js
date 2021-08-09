const express = require("express");
const app = express();
require('dotenv').config()
const fs = require("fs");
const session = require("express-session");
const nodemailer = require('nodemailer');
app.set("view engine", "ejs");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.get("/", function (req, res) {
  fs.readFile("db.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    // console.log("File data:", jsonString);
    let j = JSON.parse(jsonString);
    // console.log(j);
  });
  res.render("pages/auth");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App listening on port " + port));

// importing passport for oauth
const passport = require("passport");
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.get("/success", (req, res) => {
  console.log(userProfile);
  // storing user details to db.json file
  const user = JSON.stringify(userProfile);
  try {
    fs.writeFileSync("db.json", user);
  
  res.redirect('/')
  } catch (error) {
    console.log(error);
  }
  
});

// error request
app.get("/error", (req, res) => res.send("error logging in"));

// api call for sending email
app.get("/send", (req, res) => {
		const message = {
	    from: 'xxx@gmail.com', // Sender address
	    to: 'xxx@gmail.com',         // recipients
	    subject: 'subject', // Subject line
	    text: req.body.msg // Plain text body  passed through the request body
	};

  // gmail sending execution
	transport.sendMail(message, function(err, info) {
	    if (err) {
	      console.log(err)
	    } else {
	      console.log('mail has sent.');
	      console.log(info);
	    }
	});
});

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


// google auth setup
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// connecting with goolge api and connecting the user
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = {profile,accessToken,refreshToken};
      
      return done(null, userProfile);
    }
  )
);

// request for oauth pop up screen
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect("/success");
  }
);

// connecting nodemailer
let transport = nodemailer.createTransport({
  service: "gmail",
     auth: {
          type: "OAuth2",
          user: "xxx@xxx.com", 
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: "Your Refresh Token Here",
          accessToken: "<your access token>"
     }
});
