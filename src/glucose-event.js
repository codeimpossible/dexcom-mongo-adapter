const mongoose = require('mongoose');

const glucoseEventSchema = new mongoose.Schema({
  glucose: Number,
  trend: String,
  wt: Date,
  st: Date,
  dt: Date
});
const GlucoseEvent = mongoose.model('GlucoseEvent', glucoseEventSchema);

module.exports = GlucoseEvent;
