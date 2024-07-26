const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulating = require('mongoose-autopopulate');

mongoose.plugin(autopopulating);
const bikeSchema = new Schema({
  model: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    enum: [
      'red',
      'blue',
      'green',
      'yellow',
      'lavender',
      'gray',
      'pink',
      'black',
      'white',
    ],
    default: 'black',
  },
  location: new Schema({
    type: { type: String, required: true },
    coordinates: { type: [Number], required: true },
  }),
  address: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: 'media',
      autopopulate: true,
    },
  ],
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
});

bikeSchema.set('timestamps', true);
module.exports = Bike = mongoose.model('bike', bikeSchema);
