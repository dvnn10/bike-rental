const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulating = require('mongoose-autopopulate');
mongoose.plugin(autopopulating);

const ratingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  },
  bikeId: {
    type: Schema.Types.ObjectId,
    ref: 'Bike',
    autopopulate: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

ratingSchema.set('timestamps', true);
module.exports = Rating = mongoose.model('rating', ratingSchema);
