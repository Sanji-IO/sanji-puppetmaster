var moment = require("moment");
var Task = require("./task");

var Job = function(destination, request, options) {
  options = options || {};

  this.id = +"";
  this.createdAt = moment().toISOString();
  this.finishedAt = null;
  this.timeout = options.timeout || 3600;
  this.status = "";
  this.progress = +"";
  this.totalCount = 0;
  this.doneCount = 0;
  this.errorCount = 0;
  this.collection = [];

  if (destination && request) {
    this.collection = new Task(destination, request);
    this.totalCount = this.collection.length;
  }
};

Job.prototype.submitAll = function(doneCb, updateCb) {
  var self = this;
  this.collection.forEach(function(task) {
    task.submit(self._taskDoneCallback(doneCb, updateCb).bind(self));
  });
};

Job.prototype._taskDoneCallback = function(doneCb, updateCb) {
  return function(err, task) {
    // Update count and progress percentage
    if (err) {
      this.errorCount += 1;
    }
    this.doneCount++;
    this.progress = (this.doneCount / this.totalCount) * 100;

    if (updateCb && typeof updateCb === "function") {
      updateCb(err, task);
    }

    // if all task had been done.
    if (this.doneCount === this.totalCount) {
      return doneCb(null, this);
    }
  };
};

module.exports = Job;
