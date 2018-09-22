const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();
const bcryptSalt = 10;
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');


router.get('/signup', ensureLoggedOut(), (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', ensureLoggedOut(), (req, res, next) => {

  const {
    nameInput,
    emailInput,
    passwordInput
  } = req.body;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/signup', {
      errorMessage: 'Enter both email and password to sign up.'
    });
    return;
  }

  User.findOne({ emailInput }, '_id', (err, existingUser) => {
    if (err) {
      next(err);
      return;
    }
    if (existingUser !== null) {
      res.render('auth/signup', {
        errorMessage: `The email ${emailInput} is already in use.`
      });
      return;
    }
    console.log("PassworInput",passwordInput);
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(passwordInput, salt);
    console.log(hashPass);
    const userSubmission = {
      name: nameInput,
      email: emailInput,
      password: hashPass
    };

    const theUser = new User(userSubmission);

    theUser.save((err) => {
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Something went wrong. Try again later.'
        });
        return;
      }

      res.redirect('/');
    });
  });
});

router.get('/login', ensureLoggedOut(), (req, res, next) => {
  res.render('auth/login');
});

router.post("/login", ensureLoggedOut(), passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
})
)
router.get('/logout', ensureLoggedIn(), (req,res) => {
  req.logout();
  res.redirect('/login');
})


module.exports = router;