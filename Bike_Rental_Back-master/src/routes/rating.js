const express = require('express');
const router = express.Router();
const User = require('../models/User');
const checkUserAuth = require('../middleware/checkUserAuth');
const { check } = require('express-validator');
const Bike = require('../models/Bike');
const Rating = require('../models/Rating');

// #route:  POST /delete-bike
// #desc:   Reserve Bike
// #access: Public
router.post(
  '/rate-bike',
  [
    checkUserAuth,
    check('bikeId', 'bikeId is Required').not().isEmpty(),
    check('rating', 'rating is Required')
      .not()
      .isEmpty()
      .isNumeric({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    try {
      const bike = await Bike.findById(req.body.bikeId);
      const user = await User.findById(req.userId);
      const rating = await Rating.findOne({
        bikeId: req.body.bikeId,
        userId: req.userId,
      });

      if (rating) {
        return es.json({
          success: false,
          error: 'Rating already submitted',
        });
      }

      if (!bike || !user) {
        return res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        const { bikeId, rating } = req.body;

        const newRating = new Rating({
          bikeId,
          rating,
          userId: req.userId,
        });

        const ratingsave = await newRating.save();

        if (!ratingsave) {
          res.json({
            success: false,
            error: 'Oh, something went wrong. Please try again!',
          });
        } else {
          res.json({ success: true, data: ratingsave });
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

module.exports = router;
