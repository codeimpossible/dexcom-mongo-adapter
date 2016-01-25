#! /usr/bin/env node

const mongoose = require('mongoose');
const Adapter = require('./../index');

process.stdout.write(log_date() + 'dexcom-mongo-adapter connecting to mongo...');

mongoose.connect(process.env.MONGO_URI);

process.stdout.write('connected!\n');

const login_params = {
  USERNAME: process.env.DEXCOM_USERNAME,
  PASSWORD: process.env.DEXCOM_PASSWORD
};

const api = new Adapter.DexcomApi({
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
      console.log('    ', json.glucose, '@', json.wt);
      const event = new Adapter.GlucoseEvent(json);
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
