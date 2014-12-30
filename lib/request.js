var _ = require('lodash'),
    moment = require('moment'),
    Promise = require('bluebird'),
    Request;

function RequestTimeout(message) {
    this.name = 'RequestTimeout';
    this.message = message;
    this.stack = (new Error()).stack;
}

RequestTimeout.prototype = new Error();

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

Request.prototype.RequestTimeout = RequestTimeout;

Request.prototype.submit = function submit(bundle, cb) {
  var self = this;
  self.__request.status = 'dispatching';
  // send to remote
  bundle
    .publish
    .direct[this.method](this.resource, this.data, this.__request.destination)
    .timeout(this.__request.timeout)
    .tap(function() {
      self.__request.progress = 100;
      self.__request.finishedAt = moment().toISOString();
    })
    .then(this._sucessCb(cb).bind(this))
    .catch(this._errorCb(cb).bind(this));
};

Request.prototype._timeoutCallback = function _timeoutCallback(cb) {

  return function() {
    this.__request.status = 'timeout';
    cb(new RequestTimeout('timeout'), this);
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

  return function(e) {
    if (e instanceof Promise.TimeoutError) {
      self.__request.status = 'timeout';
      return cb(e, self);
    }

    var data = e.data || null,
        code = e.code || 500;

    self.__request.status = 'error';
    self.__request.result = {
      code: code,
      resource: self.resource,
      data: data
    };

    return cb(e, self);
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

  clonedObj = _.cloneDeep(obj);
  return clonedObj;
};

module.exports = Request;
