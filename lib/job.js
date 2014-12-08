var moment = require("moment");
var Request = require("./request");
var Storage = require("./storage");

var Job = function(destination, request, options) {
  options = options || {};

  this.id = Math.floor(Math.random() * 10000) + 1;
  this.createdAt = moment().toISOString();
  this.finishedAt = null;
  this.timeout = options.timeout || 3600;
  this.status = "created";
  this.progress = +"";
  this.totalCount = 0;
  this.doneCount = 0;
  this.errorCount = 0;
  this.requests = [];

  if (destination && request) {
    this.requests = new Request(destination, request);
    if (!Array.isArray(this.requests)) {
      this.requests = [this.requests];
    }
    this.totalCount = this.requests.length;
  }
};

Job.prototype.submitAll = function(doneCb, updateCb) {
  var self = this;
  this.requests.forEach(function(request) {
    request.submit(self._requestDoneCallback(doneCb, updateCb).bind(self));
  });
};

Job.prototype._requestDoneCallback = function(doneCb, updateCb) {
  return function(err, request) {
    // Update count and progress percentage
    if (err) {
      this.errorCount += 1;
    }
    this.doneCount++;
    this.progress = (this.doneCount / this.totalCount) * 100;

    if (updateCb && typeof updateCb === "function") {
      updateCb(err, request);
    }

    // if all request had been done.
    if (this.doneCount === this.totalCount) {
      return doneCb(null, this);
    }
  };
};

Job.prototype.toJSON = function() {
  var obj = {};
  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      obj[prop] = this[prop];
    }
  }

  return JSON.stringify(obj);
};

Job.prototype.save = function(path) {
  return new Storage(path).save(this.toJSON());
};

Job.prototype.load = function(path) {
  return (new Storage("/tmp").load(path));
};

module.exports = Job;
