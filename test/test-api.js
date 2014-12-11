var log = require('sanji-logger')('puppetmaster-test'),
    path = require('path'),
    should = require('should'),
    // sinon = require('sinon'),
    request = require('supertest'),
    express = require('express'),
    PuppetMaster = require('../index'),
    // Promise = require('bluebird'),
    // rimraf = require('rimraf'),
    fs = require('fs');


function makeMockPromise(resource, data) {
  return new Promise(function (resolve) {
    return resolve({
      code: 200,
      data: {
        resource: resource,
        data: data
      }
    });
  });
}

describe('PuppetMaster', function() {

  var app, pm, reqData, reqRequestData,
      BUNDLES_HOME = __dirname;

  beforeEach(function() {
    app = express();
    app.use(require('body-parser').json());
    pm = PuppetMaster();
    app.use(pm);
    pm = pm.puppetmaster;

    reqData = {
      destinations: 'AA-BB-CC-DD-11-22',
      message: {
        method: 'get',
        resource: '/system/status',
        data: {
          test: 'reqData'
        }
      }
    };

    reqRequestData = {
      destination: 'AA-BB-CC-DD-11-22',
      message: {
        method: 'get',
        resource: '/system/status',
        data: {
          test: 'reqRequestData'
        }
      }
    };

    // ['get', 'post', 'put', 'delete'].forEach(function(method) {
    //   se.bundle.publish[method] = makeMockPromise;
    // });
  });

  describe('Job API Endpoints', function() {

    beforeEach(function(done) {
      request(app).post('/jobs').send(reqData).expect(200).end(done);
    });

    it('[Get] /jobs should get all jobs (one)', function(done) {
      request(app)
        .get('/jobs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          res.body.length.should.be.equal(1);
          done();
        });
    });

    it('[Get] /jobs/:id should be able to get a job by id', function(done) {
      request(app)
        .get('/jobs/' + Object.keys(pm.jobs)[0])
        .send(reqData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('[Get] /jobs/:id should return 404 if job id dosen\'t exist', function(done) {
      request(app)
        .get('/jobs/100')
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('[Post] /jobs should be able to create a job with a request', function(done) {
      request(app)
        .post('/jobs')
        .send(reqData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          should(pm.jobs[res.body.id]).be.exist;
          done();
        });
    });

  });

  describe('Request API Endpoints', function() {

    beforeEach(function(done) {
      request(app).post('/jobs').send(reqData).expect(200).end(done);
    });

    it('[Get] /requests/:id should be able to get arequest by id', function(done) {
      request(app).get('/jobs').expect(200).expect('Content-Type', /json/).end(function(err, res) {
        request(app)
          .get('/requests/' + res.body[0].requests[0].id)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, _res) {
            if (err) {
              done(err);
            }
            _res.body.id.should.be.equal(res.body[0].requests[0].id);
            done();
          });
      });
    });

    it('[Get] /requests/:id should return 404 if request id dosen\'t exist', function(done) {
      request(app)
        .get('/requests/100')
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('[Post] /requests should be able to create a request', function(done) {
      request(app)
        .post('/requests')
        .send(reqData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          done();
        });
    });
  });
});
