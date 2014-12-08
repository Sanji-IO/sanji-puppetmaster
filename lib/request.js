var moment = require("moment");

var Request = function Request(destination, message, options) {

  options = options || {};
  var requests = [];

  if (Array.isArray(destination) && destination.length === 1) {
    destination = destination[0];
  }

  if (!Array.isArray(destination)) {
    this.id = Math.floor(Math.random() * 10000) + 1;
    this.method = message.method;
    this.resource = message.resource;
    this.data = message.data || {};
    this.__request = {
      "destination": destination,
      "createdAt": moment().toISOString(),
      "finishedAt": null,
      "timeout": options.timeout || 36000,
      "status": "created",
      "progress": 0,
      "result": null
    };
    return this;
  }

  destination.forEach(function(dest) {
    requests.push(new Request(dest, message));
  });

  return requests;
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

  return JSON.stringify(clonedObj);
};

module.exports = Request;
