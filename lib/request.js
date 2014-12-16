var _ = require('lodash'),
    moment = require('moment'),
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
    'destination': data.destination || null,
    'createdAt': moment().toISOString(),
    'finishedAt': null,
    'timeout': data.options.timeout || 36000,
    'status': 'created',
    'progress': 0,
    'result': null
  };
};

Request.prototype.submit = function submit(bundle, cb) {
  var self = this;
  // setup timeout timer
  this.__request.timeoutTimer = setTimeout(
    this._timeoutCallback(cb).bind(this), this.__request.timeout);

  // send to remote
  bundle
    .publish
    .direct[this.method](this.resource, this.data, this.__request.destination)
    .tap(function() {
      clearTimeout(self.__request.timeoutTimer);
      self.__request.finishedAt = moment().toISOString();
    })
    .then(
        this._sucessCb(cb).bind(this),
        this._errorCb(cb).bind(this)
      )
    .catch(this._errorCb(cb).bind(this));
};

Request.prototype._timeoutCallback = function _timeoutCallback(cb) {

  return function() {
    this.__request.status = 'timeout';
    cb('timeout', this);
  };
};

Request.prototype._sucessCb = function _sucessCb(cb) {
  var self = this;

  return function(result) {
    self.__request.status = 'resloved';
    self.__request.result = result;

    cb(null, self);
  };
};

Request.prototype._errorCb = function _errorCb(cb) {
  var self = this;

  return function(result) {
    clearTimeout(self.__request.timeoutTimer);
    self.__request.finishedAt = moment().toISOString();
    self.__request.status = 'error';

    cb(result, null);
  };
};

Request.prototype.toJSON = function toJSON() {

  var clonedObj,
      obj = {};

  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      obj[prop] = this[prop];
    }
  }

  // clonedObj = JSON.parse(JSON.stringify(obj));  // perform deep copy
  clonedObj = _.cloneDeep(obj);
  if (clonedObj.__request.timeoutTimer) {
    delete clonedObj.__request.timeoutTimer;
  }

  return clonedObj;
};

module.exports = Request;
