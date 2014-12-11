var _ = require('lodash'),
    express = require('express'),
    Job = require('./lib/job'),
    Request = require('./lib/request'),
    PuppetMaster;

PuppetMaster = function PuppetMaster() {

  if (!(this instanceof PuppetMaster)) {
    return new PuppetMaster();
  }

  this.jobs = {};
  this.requests = {};

  // setup routing paths
  this.router = express.Router();
  this.router.route('/jobs')
    .get(this.getAllJobs.bind(this))
    .post(this.createJob.bind(this));

  this.router.route('/jobs/:id')
    .get(this.getOneJob.bind(this));

  this.router.route('/requests')
    .post(this.createRequest.bind(this));

  this.router.route('/requests/:id')
    .get(this.getOneRequest.bind(this));

  this.router.puppetmaster = this;

  return this.router;
};

PuppetMaster.prototype.getAllJobs = function getAllJobs(req, res) {
  return res.json(_.values(this.jobs));
};

PuppetMaster.prototype.createJob = function createJob(req, res) {
  var self = this,
      data = req.body,
      job;

  job = new Job(data);
  this.jobs[job.id] = job;
  job.requests.forEach(function(request) {
    self.requests[request.id] = request;
  });

  return res.json(job);
};

PuppetMaster.prototype.getOneJob = function getOneJob(req, res) {
  var job = this.jobs[Number(req.params.id)];

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

  request = new Request(data);
  this.requests[request.id] = request;

  return res.json(request);
};


PuppetMaster.prototype.getOneRequest = function getOneRequest(req, res) {
  var request = this.requests[Number(req.params.id)];

  if (!request) {
    return res.status(404).json(
      {message: 'Can\'t find request id: ' + req.params.id});
  }

  return res.json(request);
};


module.exports = PuppetMaster;
