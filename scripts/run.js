#! /usr/bin/env node

process.env.MONGO_URI = '';
process.env.DEXCOM_USERNAME = '';
process.env.DEXCOM_PASSWORD = '';

require('./../index');
