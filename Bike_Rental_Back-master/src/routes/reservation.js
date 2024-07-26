const express = require('express');
const router = express.Router();
const User = require('../models/User');

const emailService = require('../components/nodemailer');
const checkUserAuth = require('../middleware/checkUserAuth');
const { check } = require('express-validator');
const checkManager = require('../middleware/checkManager');
const checkAnyAuth = require('../middleware/checkAnyAuth');
const Bike = require('../models/Bike');
const Reservation = require('../models/Reservation');

// #route:  POST /delete-bike
// #desc:   Reserve Bike
// #access: Public
router.post(
  '/reserve-bike',
  [
    checkAnyAuth,
    check('bikeId', 'bikeId is Required').not().isEmpty().trim().escape(),
    check('startDate', 'startDate is Required').not().isEmpty(),
    check('endDate', 'endDate is Required').not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const bike = await Bike.findById(req.body.bikeId);

      var user;
      if (req.userRole === 'manager') {
        user = await User.findOne({
          _id: req.body.userId,
        });
      } else {
        user = await User.findOne({
          _id: req.userId,
        });
      }

      if (!bike || !user) {
        res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        const { bikeId, startDate, endDate } = req.body;

        const newReservation = new Reservation({
          bikeId,
          startDate,
          endDate,
          userId: req.userId,
        });

        const reservation = await newReservation.save();

        if (!reservation) {
          res.json({
            success: false,
            error: 'Oh, something went wrong. Please try again!',
          });
        } else {
          const data = {
            from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM_USER}>`,
            to: user.email,
            subject: `Your Reservation Confirmation for ${bike.model}`,
            text: `Thanks for choosing ${process.env.APP_NAME}`,
            html: `<p>Your bike reservation for ${bike.model} has been confirmed for duration of ${newReservation.startDate} to ${newReservation.endDate}</p>`,
          };
          emailService.sendMail(data);

          res.json({ success: true, data: newReservation });
        }
      }
    } catch (err) {
      console.log('Error on /api/reservation/reserve-bike: ', err);
      res.json({
        success: false,
        error: 'Oh, something went wrong. Please try again!',
      });
    }
  }
);

// #route:  GET /get-reservation/:id
// #desc:   Delete Bike
// #access: Public
router.get('/:id', checkUserAuth, async (req, res) => {
  try {
    if (req.params.id == 'all') {
      const reservation = await Reservation.find({
        userId: req.userId,
      });
      return res.status(200).send({ success: true, data: reservation });
    } else {
      const reservation = await Reservation.findOne({
        id: req.params.id,
        userId: req.userId,
      });
      if (!reservation) {
        return res
          .status(200)
          .json({ success: false, msg: 'Reservation Not Found' });
      }
      return res.status(200).send({ success: true, data: reservation });
    }
  } catch (err) {
    console.log('Error on /api/reservation/get-reservation: ', err);
    res.json({
      success: false,
      error: 'Oh, something went wrong. Please try again!',
    });
  }
});

// #route:  POST /cancel-reservation
// #desc:   Cancel Bike Reservation
// #access: Public
router.patch(
  '/cancel-reservation',
  [
    checkAnyAuth,
    check('reservationId', 'reservationId is Required').not().isEmpty(),
  ],
  async (req, res) => {
    try {
      let reservation = await Reservation.findById(req.body.reservationId);
      console.log(reservation.userId._id.toString(), req.userId, req.userRole);
      if (
        req.userRole !== 'manager' &&
        reservation.userId._id.toString() !== req.userId
      ) {
        return res.status(401).json({
          success: false,
          error: 'Opps, Unauthorized',
        });
      }
      if (!reservation) {
        return res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        const reservationFields = {
          status: 'cancelled',
        };
        reservation = await Reservation.findOneAndUpdate(
          { _id: req.body.reservationId },
          { $set: reservationFields },
          { new: true }
        );

        return res.json({
          success: true,
          data: '',
        });
      }
    } catch (err) {
      console.log('Error on /api/reservation/reserve-bike: ', err);
      res.json({
        success: false,
        error: 'Oh, something went wrong. Please try again!',
      });
    }
  }
);

// #route:  GET /user-reservations/:id
// #desc:   Delete Bike
// #access: Manager
router.get('/user-reservation/:id', checkManager, async (req, res) => {
  try {
    if (req.params.id == 'all') {
      const reservation = await Reservation.find();

      return res.status(200).send({ success: true, data: reservation });
    } else {
      const reservation = await Reservation.findOne({
        id: req.params.id,
      });

      if (!reservation) {
        return res
          .status(200)
          .json({ success: false, msg: 'Reservation Not Found' });
      }
      return res.status(200).send({ success: true, data: reservation });
    }
  } catch (err) {
    console.log('Error on /api/reservation/get-reservation: ', err);
    res.json({
      success: false,
      error: 'Oh, something went wrong. Please try again!',
    });
  }
});

// #route:  GET /user-reservations/:id
// #desc:   Delete Bike
// #access: Manager
router.get('/user-reservation/:userId', checkManager, async (req, res) => {
  try {
    const reservation = await Reservation.find({
      userId: req.params.userId,
    })
      .populate('userId')
      .populate('bikeId');
    if (!reservation) {
      return res
        .status(200)
        .json({ success: false, msg: 'Reservation Not Found' });
    }
    return res.status(200).send({ success: true, data: reservation });
  } catch (err) {
    console.log('Error on /user-reservation/:userId: ', err);
    res.json({
      success: false,
      error: 'Oh, something went wrong. Please try again!',
    });
  }
});

module.exports = router;
