const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const checkManager = require('../middleware/checkManager');
const checkAnyAuth = require('../middleware/checkAnyAuth');
const Bike = require('../models/Bike');
const Media = require('../models/Media');
const Reservation = require('../models/Reservation');
const Rating = require('../models/Rating');
const BikeResult = require('../models/BikeResult');

const uploadImage = require('../middleware/imageUpload');

// #route:  POST /create/
// #desc:   Add/update new Bike
// #access: Private
router.post(
  '/:bikeId',
  [
    checkManager,
    uploadImage.uploadImages,
    uploadImage.getNumber,
    check('model', 'model is Required').not().isEmpty(),
    check('color', 'color is Required').not().isEmpty(),
    check('address', 'address is Required').not().isEmpty(),
    check('brand', 'brand is Required').not().isEmpty(),
    check('weight', 'weight is Required').not().isEmpty(),
    check('isAvailable', 'isAvailable  is Required').not().isEmpty(),
    check('latitude', 'latitude  is Required').not().isEmpty(),
    check('longitude', 'longitude  is Required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    const {
      model,
      color,
      address,
      brand,
      weight,
      isAvailable,
      latitude,
      longitude,
    } = req.body;

    const bikeFields = {};
    var images = [];
    await Promise.allSettled(
      req.files.map(async (file) => {
        file['uploadedBy'] = req.userId;
        const newMedia = new Media(file);
        const mediaupload = await newMedia.save();
        images.push(mediaupload._id);
      })
    );

    if (model) bikeFields.model = model;
    if (color) bikeFields.color = color;
    if (address) bikeFields.address = address;
    if (brand) bikeFields.brand = brand;
    if (weight) bikeFields.weight = weight;
    if (images.length > 0) bikeFields.images = images;
    if (isAvailable) bikeFields.isAvailable = isAvailable;

    if (latitude && longitude) {
      const location = {
        coordinates: [latitude, longitude],
        type: 'Point',
      };
      if (location) bikeFields.location = location;
    }

    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    } else {
      try {
        if (req.params.bikeId === 'add') {
          let bike = new Bike(bikeFields);
          await bike.save();

          return res.json({ success: true, data: bike });
        } else {
          let bike = await Bike.findOne({
            _id: req.params.bikeId,
          });
          if (bike) {
            let bike_up = await Bike.findOneAndUpdate(
              { _id: req.params.bikeId },
              { $set: bikeFields },
              { new: true }
            );

            return res.json({ success: true, data: bike_up });
          }
        }
      } catch (err) {
        return res.status(500).json({ success: false, errors: err });
      }
    }
  }
);

router.get('/geojson', async (req, res) => {
  try {
    let limit = 1000;
    let bikes = [];
    var getallBikes = await Bike.find()
      .sort({
        createdAt: -1,
      })
      .limit(limit)

      .exec(function (err, data) {
        data.forEach((bike) => {
          if (bike.location !== null) {
            bikes.push(bike);
          }
        });
        const geojson = {
          type: 'FeatureCollection',
          features: bikes.map((bike) => {
            return {
              type: 'Feature',
              properties: {
                _id: bike._id,
                model: bike.model,
                color: bike.color,
                address: bike.address,
                brand: bike.brand,
                images: bike.images,
                weight: bike.weight,
                isAvailable: bike.isAvailable,
                category: 'Bikes',
              },
              geometry: bike.location,
            };
          }),
        };

        return res.status(200).send(geojson);
      });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(200).json({ success: false, msg: 'Listing Not Found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// #route:  GET /get/all|bikeID
// #desc:   Get specific Bike or all Bike
// #access: Public
router.get('/:bikeId', [checkAnyAuth], async (req, res) => {
  try {
    if (req.params.bikeId == 'all') {
      let limit = 999;
      page = 1;
      bikeQueries = {};
      sortBy = {};
      var ratingResult = {};
      var bikeIds = [];

      const agg = await Rating.aggregate(
        [
          {
            $group: {
              _id: '$bikeId',
              avgRating: { $avg: { $ifNull: ['$rating', 0] } },
            },
          },
        ],
        function (err, results) {
          results.forEach((result) => {
            let id = result._id.toString();
            if (req.query.rating) {
              if (result.avgRating >= req.query.rating) {
                bikeIds.push(result._id);
                ratingResult[id] = result.avgRating;
              }
            } else {
              ratingResult[id] = result.avgRating;
            }
          });
        }
      );

      let query = Object.keys(req.query).reduce((mappedQuery, key) => {
        let param = req.query[key];
        if (param) {
          if (key === 'limit') {
            limit = parseInt(param);
          } else if (key === 'page') {
            page = parseInt(param);
          } else if (key.includes('sortBy')) {
            if (param === 'oldest') {
              sortBy = {
                createdAt: 1,
              };
            } else {
              sortBy = {
                createdAt: -1,
              };
            }
          } else {
            if (key === 'model') {
              bikeQueries[key] = {
                $regex: '.*' + param + '.*',
                $options: 'i',
              };
            } else if (key === 'address') {
              bikeQueries[key] = {
                $regex: '.*' + param + '.*',
                $options: 'i',
              };
            } else if (key === 'color') {
              bikeQueries[key] = {
                $regex: param,
              };
            } else if (key === 'rating') {
              bikeQueries['_id'] = {
                $in: bikeIds,
              };
            } else {
              bikeQueries[key] = param;
            }
          }
          bikeQueries['isAvailable'] = true;
        }
      }, {});
      console.log(bikeQueries);
      var getallBikes = await Bike.find(bikeQueries)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await Bike.countDocuments();
      return res.status(200).send({
        success: true,
        data: {
          bikes: getallBikes,
          totalCount: count,
          ratingResult: ratingResult,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          limit: limit,
        },
      });
    } else {
      const getBikes = await Bike.findById(req.params.bikeId);

      let params = {
        bikeId: req.params.bikeId,
      };
      if (req.userRole === 'user') {
        params.userId = req.userId;
      }
      const reservations = await Reservation.find(params);

      if (!getBikes) {
        return res.status(200).json({ success: false, msg: 'Bikes Not Found' });
      }
      return res
        .status(200)
        .send({ success: true, data: getBikes, reservations: reservations });
    }
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(200).json({ success: false, msg: 'Bikes Not Found' });
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// #route:  POST /delete-bike
// #desc:   Delete Bike
// #access: Public
router.delete('/delete-bike/:bikeId', checkManager, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.bikeId);

    if (!bike) {
      res.json({
        success: false,
        error: 'Oh, something went wrong. Please try again!',
      });
    } else {
      const deleted = await Bike.deleteOne({
        _id: req.params.bikeId,
      });

      if (!deleted) {
        res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        req.session = null;
        res.json({ success: true });
      }
    }
  } catch (err) {
    console.log('Error on /api/auth/delete-bike: ', err);
    res.json({
      success: false,
      error: 'Oh, something went wrong. Please try again!',
    });
  }
});

module.exports = router;
