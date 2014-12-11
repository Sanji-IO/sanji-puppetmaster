var moment = require("moment"),
    Request = require("./request"),
    Storage = require("./storage"),
    Job;

Job = function Job(data) {

  if (!(this instanceof Job)) {
    return new Job(data);
  }

  data = data || {};
  data.options = data.options || {};

  this.id = Math.floor(Math.random() * 10000) + 1;
  this.createdAt = moment().toISOString();
  this.finishedAt = null;
  this.timeout = data.options.timeout || 3600;
  this.status = "created";
  this.progress = +"";
  this.totalCount = 0;
  this.doneCount = 0;
  this.errorCount = 0;
  this.requests = [];
  var self = this;

  if (data.destinations && data.message) {

    if (!Array.isArray(data.destinations)) {
      data.destinations = [data.destinations];
    }

    data.destinations.forEach(function(dest) {
      self.requests.push(new Request({
        destination: dest,
        message: data.message
      }));
    });

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

  return obj;
};

Job.prototype.save = function(path) {
  return new Storage(path).save(this.toJSON());
};

Job.prototype.load = function(path) {
  return (new Storage("/tmp").load(path));
};

module.exports = Job;
