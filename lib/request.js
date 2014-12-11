var moment = require("moment"),
    Request;

Request = function Request(data) {

  if (!(this instanceof Request)) {
    return new Request(data);
  }

  data = data || {};
  data.options = data.options || {};

  this.id = Math.floor(Math.random() * 10000) + 1;
  this.method = data.message.method;
  this.resource = data.message.resource;
  this.data = data.message.data || {};
  this.__request = {
    "destination": data.destination,
    "createdAt": moment().toISOString(),
    "finishedAt": null,
    "timeout": data.options.timeout || 36000,
    "status": "created",
    "progress": 0,
    "result": null
  };
};

Request.prototype.submit = function submit(cb) {

  // setup timeout timer
  this.__request.timeoutTimer = setTimeout(
    this._timeoutCallback(cb).bind(this), this.__request.timeout);

  // send to remote
  this._send(this._sendCallback(cb).bind(this));
};

Request.prototype._timeoutCallback = function _timeoutCallback(cb) {

  return function() {
    this.__request.status = "timeout";
    this.__request.finishedAt = moment().toISOString();
    cb("timeout", this);
  };
};

Request.prototype._sendCallback = function _sendCallback(cb) {
  var self = this;

  return function(err) {
    clearTimeout(self.__request.timeoutTimer);
    self.__request.status = "resloved";
    self.__request.finishedAt = moment().toISOString();

    if (err) {
      self.__request.status = "error";
    }

    cb(err, self);
  };
};

Request.prototype._send = function _send(cb) {
  cb(null, this);
};

Request.prototype.toJSON = function toJSON() {

  var clonedObj,
      obj = {};

  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      obj[prop] = this[prop];
    }
  }

  clonedObj = JSON.parse(JSON.stringify(obj));  // perform deep copy
  if (clonedObj.__request.timeoutTimer) {
    delete clonedObj.__request.timeoutTimer;
  }

  return clonedObj;
};

module.exports = Request;
