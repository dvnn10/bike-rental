const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autopopulating = require('mongoose-autopopulate');
mongoose.plugin(autopopulating);

const reservationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    autopopulate: true,
  },
  bikeId: {
    type: Schema.Types.ObjectId,
    ref: 'bike',
    autopopulate: true,
  },
  startDate: {
    type: Schema.Types.Date,
    required: true,
  },
  endDate: {
    type: Schema.Types.Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['reserved', 'cancelled'],
    default: 'reserved',
  },
});

reservationSchema.set('timestamps', true);
module.exports = Reservation = mongoose.model('reservation', reservationSchema);
