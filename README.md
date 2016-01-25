dexcom-mongo-adapter
=======================

[dexcom-eula]: http://www.dexcom.com/node/5421
[blog-post]: http://www.hanselman.com/blog/BridgingDexcomShareCGMReceiversAndNightscout.aspx

originally forked from https://github.com/bewest/share2nightscout-bridge, thanks to the hard work done by [Ben West](https://github.com/bewest) and [Scott Hanselman](https://github.com/shanselman).

### Prerequisites

* A working Dexcom Share receiver paired to an Apple device that is
  successfully uploading data to Dexcom.  You must be able to see the Dexcom
  data in the Dexcom Follow app for the bridge to work.
* Your Dexcom Sharer username and password
* A working Nightscout website and Mongo database

### Install

Currently, you'll need to clone this repo, and run `node ./index.js` to start the service. If you're running this on a vpc via ssh, it's a good idea to start the service in a `screen` - literally: `$ screen npm start` - so you don't kill it when you close your ssh session (this has saved me hours of grief in the past!).

### Environment

`VARIABLE` (default) - description

#### Required

* `DEXCOM_USERNAME` - Your Dexcom Share2 username
* `DEXCOM_PASSWORD` - Your Dexcom Share2 password
* `MONGO_URI` - The connection uri to your mongolab instance. e.g. `mongodb://<dbuser>:<dbpassword>@<instance>.mongolab.com:49925/<db_name>`

### More information

This code is based off of the dexcom share bridge, [as described by Scott Hanselman][blog-post], the bridge logs in to Dexcom Share as the data publisher.  It re-uses the token every `5` minutes to fetch the `maxCount` latest glucose records within the last specified `minutes`.

This information is then sent to the specified mongo database. From there you can use the data to do anything you'd like. It will continue to re-use the same `sessionID` until it expires, at which point it should attempt to log in again. If it can log in again, it will continue to re-use the new token to fetch data, storing it into mongodb.

This project is not FDA approved, not recommended for therapy, and not recommended by [Dexcom][dexcom-eula].
