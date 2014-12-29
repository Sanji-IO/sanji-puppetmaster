var _ = require('lodash'),
    express = require('express'),
    Job = require('./lib/job'),
    Request = require('./lib/request'),
    logger = require('sanji-logger')('PuppetMaster'),
    PuppetMaster;

PuppetMaster = function PuppetMaster(bundle, io) {

  if (!(this instanceof PuppetMaster)) {
    return new PuppetMaster(bundle, io);
  }

  // jobs and requests
  this._jobs = {};
  this._requests = {};
  this.io = io;
  this.bundle = bundle;

  // setup routing paths
  var router = express.Router();

  router.post('/jobs', this.initializeRequest.bind(this));
  router.post('/requests', this.initializeRequest.bind(this));

  // Job
  router.route('/jobs')
    .get(this.getAllJobs.bind(this))
    .post(this.createJob.bind(this));

  router.route('/jobs/:id')
    .get(this.getOneJob.bind(this));

  // Request
  router.route('/requests')
    .get(this.getAllRequests.bind(this))
    .post(this.createRequest.bind(this));

  router.route('/requests/:id')
    .get(this.getOneRequest.bind(this));

  router.puppetmaster = this;

  return router;
};

PuppetMaster.prototype.initializeRequest = function(req, res, next) {

  if (req.body.formData) {
    req.body = JSON.parse(req.body.formData);
  }

  if (req.mqttData && req.mqttData.data && req.mqttData.data._file) {
    req.body.message.data = req.body.message.data || {};
    req.body.message.data._file = req.mqttData.data._file;
  }

  req.bundle = this.bundle;

  next();
};

PuppetMaster.prototype.getAllJobs = function getAllJobs(req, res) {
  return res.json(_.values(this._jobs));
};

PuppetMaster.prototype.createJob = function createJob(req, res) {
  var self = this,
      data = req.body,
      job;

  if (!data.destinations || !data.message || !this.vaildMessage(data.message)) {
    return res.status(400).json({
      message: 'Invaild destnations or message'
    });
  }

  job = new Job(data);
  this._jobs[job.id] = job;

  job.requests.forEach(function(request) {
    self._requests[request.id] = request;
  });

  res.json(job);

  job.submitAll(
      req.bundle,
      this.changeEventFn(req.url).bind(this),
      this.changeEventFn(req.url + '/update').bind(this)
    );
};

PuppetMaster.prototype.getOneJob = function getOneJob(req, res) {
  var job = this._jobs[Number(req.params.id)];

  if (!job) {
    return res.status(404).json(
      {message: 'Can\'t find job id: ' + req.params.id});
  }

  job = _.clone(job, true);
  job.requests = _.pluck(job.requests, 'id');

  return res.json(job);
};

PuppetMaster.prototype.createRequest = function createRequest(req, res) {
  var data = req.body,
      request;

  if (!data.destination || !data.message || !this.vaildMessage(data.message)) {
    return res.status(400).json({
      message: 'Invaild destnation or message'
    });
  }

  request = new Request(data);
  this._requests[request.id] = request;

  res.json(request);

  request
    .submit(
      req.bundle,
      this.changeEventFn(req.url).bind(this)
    );
};

PuppetMaster.prototype.getOneRequest = function getOneRequest(req, res) {
  var request = this._requests[Number(req.params.id)];

  if (!request) {
    return res.status(404).json(
      {message: 'Can\'t find request id: ' + req.params.id});
  }

  return res.json(request);
};

PuppetMaster.prototype.getAllRequests = function getAllRequests(req, res) {
  return res.json(_.values(this._requests));
};

PuppetMaster.prototype.changeEventFn = function changeEventFn(resource) {
  var self = this;

  return function(err, result) {
    var emitData = {
      resource: resource,
      data: result
    };

    logger.debug('emit change event');
    logger.trace(emitData);
    self.io.emit('sanji.puppetmaster', emitData);
  };
};

PuppetMaster.prototype.vaildMessage = function(message) {
  message = message || {};
  if (message.method && message.resource) {
    return true;
  }

  return false;
};

module.exports = PuppetMaster;
