(mongoose = require('mongoose')), (Schema = mongoose.Schema);

var BikeResultSchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  avgRating: Number,
});

module.exports = BikeResult = mongoose.model(
  'BikeResult',
  BikeResultSchema,
  null
);
