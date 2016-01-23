const mongoose = require('mongoose');
const Api = require('./src/dexcom_api');
const config = require('./src/config');

process.stdout.write(log_date() + 'dexcom-mongo-adapter connecting to mongo...');

mongoose.connect(process.env.MONGO_URI);

process.stdout.write('connected!\n');

const login_params = {
  USERNAME: process.env.DEXCOM_USERNAME,
  PASSWORD: process.env.DEXCOM_PASSWORD
};

const glucoseEventSchema = new mongoose.Schema({
  glucose: Number,
  trend: String,
  wt: Date,
  st: Date,
  dt: Date
});
const GlucoseEvent = mongoose.model('GlucoseEvent', glucoseEventSchema);

const api = new Api({
  LOGIN_PARAMS: login_params
});

var last_result = '';

function log_date() {
  return (new Date()).toISOString() + '    ';
}

function run() {
  process.stdout.write(log_date() + 'Checking dexcom...');
  return api.fetch().then(function(events) {
    process.stdout.write('done!\n');
    // insert the data to mongolab, unless we get the same result twice
    events.forEach(function(json) {
      process.stdout.write(log_date() + 'Saving to mongodb...');
      last_result = JSON.stringify(json);
      const event = new GlucoseEvent(json);
      event.save(function(err) {
        if (err) return process.stderr.write(err.stack);
        process.stdout.write('done!\n');
      });
    });
  });
}

process.stdout.write(log_date() + 'logging into dexcom...');
api.authorize().then(function() {
  process.stdout.write('done!\n');
  run().then(function() {
    setInterval(run, config().INTERVAL);
  });
});
