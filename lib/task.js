var moment = require("moment");

var Task = function(destination, message, options) {
  options = options || {};
  if (Array.isArray(destination) && destination.length === 1) {
    destination = destination[0];
  }

  if (!Array.isArray(destination)) {
    this.id = +"";
    this.method = message.method;
    this.resource = message.resource;
    this.data = message.data || {};
    this.__destination = destination;
    this.__task = {
      "createdAt": moment().toISOString(),
      "finishedAt": null,
      "timeout": options.timeout || 36000,
      "status": "created",
      "progress": 0,
      "result": null
    };
    return this;
  }

  var tasks = [];
  destination.forEach(function(dest) {
    tasks.push(new Task(dest, message));
  });

  return tasks;
};

Task.prototype.submit = function(cb) {
  // setup timeout timer
  this.__task.timeoutTimer = setTimeout(this._timeoutCallback(cb).bind(this),
                                        this.__task.timeout);
  // send to remote
  this._send(this._sendCallback(cb).bind(this));
};

Task.prototype._timeoutCallback = function(cb) {

  return function() {
    this.__task.status = "timeout";
    this.__task.finishedAt = moment().toISOString();
    cb("timeout", this);
  };
};

Task.prototype._sendCallback = function(cb) {
  var self = this;

  return function(err) {
    clearTimeout(self.__task.timeoutTimer);
    self.__task.status = "resloved";
    self.__task.finishedAt = moment().toISOString();

    if (err) {
      self.__task.status = "error";
    }

    cb(err, self);
  };
};

Task.prototype._send = function(cb) {
  cb(null, this);
};

Task.prototype.json = function() {
  var clonedObj = JSON.parse(JSON.stringify(this));  // perform deep copy
  if (clonedObj.__task.timeoutTimer) {
    delete clonedObj.__task.timeoutTimer;
  }

  return JSON.stringify(clonedObj);
};

Task.prototype.save = function() {
  this.json();
};

Task.prototype.load = function(path) {
  return new Task();
};

module.exports = Task;
