// default settings
const _ = require('lodash');

const accepts_content_type = 'application/json';

module.exports = function(specifics) {
  return _.extend({}, {
    APP_ID: 'd89443d2-327c-4a6f-89e5-496bbb0317db',
    INTERVAL: 5 * 60 * 1000,
    HEADERS: {
      USER_AGENT: 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
      ACCEPTS: accepts_content_type,
      CONTENT_TYPE: accepts_content_type,
    },
    URLS: {
      LOGIN: 'https://share1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName',
      LATEST_GLUCOSE: 'https://share1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues',
    },
    MIN_PASSPHRASE_LENGTH: 12,
    DEXCOM_API: {
      MAX_COUNT: 1,
      MINUTES: 1440,
      MAX_FAILURES: 3,
      FIRST_FETCH_COUNT: 3
    }
  }, specifics || {});
};
