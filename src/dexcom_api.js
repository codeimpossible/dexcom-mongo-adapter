const request = require('request');
const _ = require('lodash');
const qs = require('querystring');
const crypto = require('crypto');
const config = require('./config');

var reqest_promise = function(req) {
  return new Promise(function(resolve, reject) {
    request(req, function(err, res, body) {
      if(err) {
        reject({ error: err, response: res, body: body });
      } else {
        resolve({ body: body, response: res });
      }
    });
  });
};

const trend_to_friendly = [
    'NONE',
    'DRAMATIC_INCREASE',
    'INCREASE',
    'SLIGHT_INCREASE',
    'NO_CHANGE',
    'SLIGHT_DECAY',
    'DECAY',
    'DRAMATIC_DECAY',
    'NOT_COMPUTABLE',
    'OUT_OF_RANGE'
  ];

const parse_data = function(json, response) {
  const regex = /\((.*)\)/;
  const data = _.flatten([json]);
  return data.map(function(d) {
    const wt = parseInt(d.WT.match(regex)[1]);
    const st = parseInt(d.ST.match(regex)[1]);
    const dt = parseInt(d.DT.match(regex)[1]);
    return {
      trend: trend_to_friendly[d.Trend],
      glucose: d.Value,
      wt: (new Date(wt)).getTime(),
      dt: d.DT ? (new Date(dt)).getTime() : undefined,
      st: d.ST ? (new Date(st)).getTime() : undefined,
      get_response: function() {
        return response;
      }
    };
  });
};

function Api(options) {
  var FAILS = 0;
  const OPTIONS = config(options);

  var current_session = {};

  function get_latest_glucose_url() {
    var q = {
      sessionID: current_session.id,
      minutes: OPTIONS.DEXCOM_API.MINUTES,
      maxCount: OPTIONS.DEXCOM_API.MAX_COUNT
    };
    var url = OPTIONS.URLS.LATEST_GLUCOSE + '?' + qs.stringify(q);
    return url;
  }

  function get_headers(headers) {
    return _.extend({}, {
      'User-Agent': OPTIONS.HEADERS.USER_AGENT,
      'Content-Type': OPTIONS.HEADERS.CONTENT_TYPE,
      'Accept': OPTIONS.HEADERS.ACCEPTS
    }, headers);
  };

  function get_request_payload(props) {
    return _.extend({}, {
      json: true,
      method: 'POST',
      rejectUnauthorized: false
    }, props);
  }

  function get_login_payload() {
    return {
      "password": OPTIONS.LOGIN_PARAMS.PASSWORD,
      "applicationId" : OPTIONS.APP_ID,
      "accountName": OPTIONS.LOGIN_PARAMS.USERNAME
    };
  }

  // Asynchronously fetch data from Dexcom's server.
  // Will fetch `minutes` and `maxCount` records.
  var fetch = this.fetch = function fetch() {
    var headers = get_headers({ 'Content-Length': 0 });
    var req = get_request_payload({ uri: get_latest_glucose_url(), body: '', headers: headers });

    return reqest_promise(req).then(function(res) {
      return parse_data(res.body, res.response);
    }).catch(function() {
      return auth().then(function() {
        return request_promise(req).then(function(res) {
          return parse_data(res.body, res.response);
        });
      })
    });
  };

  var auth = this.authorize = function authorize() {
    const req = get_request_payload({
      uri: OPTIONS.URLS.LOGIN,
      body: get_login_payload(),
      headers: get_headers()
    });

    return reqest_promise(req)
      .then(function(res) {
        // whenever we authorize, set the new session id
        if (res.body && res.response.statusCode == 200) {
          current_session.id = res.body;
          FAILS = 0;
        }
        return res;
      })
      .catch(function(err) {
        FAILS++;
        console.error("Error refreshing token", err, err.error);
        if (FAILS >= OPTIONS.maxFailures) {
          throw "Too many login failures, check DEXCOM_ACCOUNT_NAME and DEXCOM_PASSWORD";
        }
      });
  };

  var fetch_auth = this.fetch_with_auth = function(opts) {
    return auth().then(function() {
      return fetch();
    });
  };
};

module.exports = Api;
