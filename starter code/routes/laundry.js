const express = require('express');
const router  = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/user.js')
const LaundryPickup = require('../models/laundry-pickup');




router.get("/dashboard", ensureLoggedIn(), (req, res, next) => {
  console.log(req.user);
  let query;

  if (req.user.isLaunderer) {
    query = { launderer: req.user._id };
  } else {
    query = { user: req.user._id };
  }
  console.log(query);
  LaundryPickup
    .find(query)
    .populate('user', 'name')
    .populate('launderer', 'name')
    .sort('pickupDate')
    .exec((err, pickupDocs) => {
      if (err) {
        console.log("IF ERROR")
        next(err);
        return;
      }
      console.log("!!!", pickupDocs);
      res.render('laundry/dashboard', {
        pickups: pickupDocs
      });
    });
});


router.post('/launderers', ensureLoggedIn(), (req, res, next) => {
  console.log("prueba", req.user)
  const userId = req.user._id;
  // console.log(req.session.currentUser._id)
  const laundererInfo = {
    fee: req.body.fee,
    isLaunderer: true
  };

  User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    req.user = theUser;
    res.redirect('/dashboard');
  });
});

router.get('/launderers', ensureLoggedIn(), (req, res, next) => {
  User.find({ isLaunderer: true }, (err, launderersList) => {
    if (err) {
      next(err);
      return;
    }

    res.render('laundry/launderers', {
      launderers: launderersList
    });
  });
});

router.get('/launderers/:id', ensureLoggedIn(), (req, res, next) => {
  const laundererId = req.params.id;

  User.findById(laundererId, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    res.render('laundry/launderer-profile', {
      theLaunderer: theUser
    });
  });
});

router.post('/laundry-pickups', ensureLoggedIn(), (req, res, next) => {
  const pickupInfo = {
    pickupDate: req.body.pickupDate,
    launderer: req.body.laundererId,
    user: req.user._id
  };

  const thePickup = new LaundryPickup(pickupInfo);

  thePickup.save((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/dashboard');
  });
});



module.exports = router;


// router.get('/login', ensureLoggedOut(), (req, res) => {
//   res.render('authentication/login', { message: req.flash('error')});
// });
