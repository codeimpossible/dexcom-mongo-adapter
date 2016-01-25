const Api = require('./src/dexcom_api');
const GlucoseEvent = require('./src/glucose-event');


module.exports = {
  GlucoseEvent: GlucoseEvent,
  DexcomApi: Api
};
