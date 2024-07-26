const express = require('express');
const router = express.Router();
const checkManager = require('../middleware/checkManager');
const checkAnyAuth = require('../middleware/checkAnyAuth');
const gravatar = require('gravatar');
const User = require('../models/User');
const Media = require('../models/Media');
const { hash } = require('../components/bcrypt');

// #route:  GET /get/all|profileid
// #desc:   Get specific profile or all profile
// #access: Public
router.get('/get/me', checkAnyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(200).json({ success: false, msg: 'user Not Found' });
    } else {
      return res.status(200).send({ success: true, data: user });
    }
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(200).json({ success: false, msg: 'user Not Found' });
    }
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// #route:  GET /get/all|userid
// #desc:   Get specific user or all user
// #access: Manager
router.get('/manager/getuser/:userid', checkManager, async (req, res) => {
  try {
    if (req.params.userid == 'all') {
      const user = await User.find();
      return res.status(200).send({ success: true, data: user });
    } else {
      const user = await User.findOne({
        _id: req.params.userid,
      });

      const reservations = await Reservation.find({
        userId: req.params.userid,
      });

      if (!user) {
        return res.status(200).json({ success: false, msg: 'user Not Found' });
      }
      return res.status(200).send({ success: true, data: user, reservations });
    }
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(200).json({ success: false, msg: 'user Not Found' });
    }
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

router.patch('/:userid', checkAnyAuth, async (req, res) => {
  try {
    if (req.userId != req.params.userid && req.userRole != 'manager') {
      return res
        .status(401)
        .json({ success: false, msg: 'Unauthorized Access' });
    } else {
      const {
        username,
        firstName,
        lastName,
        email,
        contactNumber,
        status,
        password,
      } = req.body;

      let user = await User.findOne({
        _id: req.params.userid,
      });
      if (!user) {
        return res.status(200).json({ success: false, msg: 'user Not Found' });
      }

      const userFields = {};
      if (username && username === user.username) {
        userFields.username = username;
      }
      if (firstName) userFields.firstName = firstName;
      if (lastName) userFields.lastName = lastName;
      if (email && email === user.email) {
        userFields.email = email;
      }
      if (contactNumber) userFields.contactNumber = contactNumber;
      if (status) userFields.status = status;
      if (password) {
        const hashedPw = await hash(password);
        userFields.password = hashedPw;
      }
      var avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: '404',
      });
      userFields.avatar = avatar;

      user = await User.findOneAndUpdate(
        { _id: req.params.userid },
        { $set: userFields },
        { new: true }
      );

      return res.status(200).send({
        success: true,
        data: user,
        message: 'User Updated Successfully',
      });
    }
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(200).json({ success: false, msg: 'user Not Found' });
    }
    console.error(err.message);
    return res.status(500).send(err);
  }
});

module.exports = router;
