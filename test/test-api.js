var log = require('sanji-logger')('puppetmaster-test'),
    should = require('should'),
    // sinon = require('sinon'),
    _ = require('lodash'),
    request = require('supertest'),
    express = require('express'),
    PuppetMaster = require('../index'),
    Promise = require('bluebird'),
    ioc = require('socket.io-client');

function makeMockPromise(resource, data, dest) {
  return new Promise(function (resolve) {
    return resolve({
      code: 200,
      data: {
        resource: resource,
        data: data,
        destination: dest
      }
    });
  });
}

function client(srv, nsp, opts){
  if ('object' === typeof nsp) {
    opts = nsp;
    nsp = null;
  }
  var addr = srv.address();
  if (!addr) {
    addr = srv.listen().address();
  }
  var url = 'ws://' + addr.address + ':' + addr.port + (nsp || '');
  return ioc(url, opts);
}

describe('PuppetMaster', function() {

  var server, app, pm, reqJobData, reqRequestData, bundle, io, ioclient,
      BUNDLES_HOME = __dirname;

  beforeEach(function() {
    app = express();
    app.use(require('body-parser').json());

    bundle = {
      publish: {
        direct: {}
      }
    };

    ['get', 'post', 'put', 'delete'].forEach(function(method) {
      bundle.publish.direct[method] = makeMockPromise;
    });

    // setup socket.io
    server = require('http').Server(app);
    io = require('socket.io')(server);
    ioclient = client(server);

    pm = PuppetMaster(bundle, io);

    app.use(pm);
    pm = pm.puppetmaster;

    reqJobData = {
      destinations: ['AA-BB-CC-DD-11-22', 'BB-CC-DD-EE-11-22'],
      message: {
        method: 'get',
        resource: '/system/status',
        data: {
          test: 'reqJobData'
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
  });

  describe('Job API Endpoints', function() {

    beforeEach(function(done) {
      request(app).post('/jobs').send(reqJobData).expect(200).end(done);
    });

    afterEach(function() {
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
        .get('/jobs/' + Object.keys(pm._jobs)[0])
        .send(reqRequestData)
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
        .send(reqJobData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          should(pm._jobs[res.body.id]).be.exist;

          var count = {
            '/jobs/update': 2,
            '/jobs': 1
          };

          ioclient.on('sanji.puppetmaster', function(data) {
            --count[data.resource];
            if (!count['/jobs/update'] && !count['/jobs']) {
              done();
            }
          });
        });
    });

    it('[Post] /jobs should return if parameter wrong', function(done) {
      request(app)
        .post('/jobs')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .end(done);
    });

  });

  describe('Request API Endpoints', function() {

    beforeEach(function(done) {
      request(app).post('/jobs').send(reqJobData).expect(200).end(done);
    });

    it('[Get] /requests/:id should be able to get arequest by id', function(done) {
      request(app).get('/requests').expect(200).expect('Content-Type', /json/).end(function(err, res) {
        request(app)
          .get('/requests/' + res.body[0].id)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, _res) {
            if (err) {
              done(err);
            }
            _res.body.id.should.be.equal(res.body[0].id);
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
        .send(reqRequestData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          var source = pm._requests[res.body.id];
          source.id.should.be.eql(res.body.id);
          source.method.should.be.eql(res.body.method);
          source.resource.should.be.eql(res.body.resource);
          source.resource.should.be.eql(res.body.resource);

          ioclient.once('sanji.puppetmaster', function() {
            done();
          });
        });
    });

    it('[Post] /requests should push only "a" notify when timeout occurs', function(done) {
      var reqData = _.clone(reqRequestData),
          promise = bundle.publish.direct.get;

      reqData.options = {timeout: 0.00001};
      bundle.publish.direct.get = function() {
        return new Promise(function() {});
      };

      request(app)
        .post('/requests')
        .send(reqData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          var cb = function(count) {
            if (count === 1) {
              setTimeout(function() {
                ioclient.removeAllListeners('sanji.puppetmaster');
                bundle.publish.direct.get = promise;
                done();
              }, 10);
            } else if (count > 1){
              bundle.publish.direct.get = promise;
              ioclient.removeAllListeners('sanji.puppetmaster');
              done('get more than one notify');
            }
          };

          var count = 0;
          ioclient.on('sanji.puppetmaster', function(result) {
            ++count;
            cb(count);
          });
        });
    });

    it('[Post] /requests should return error if parameter error', function(done) {
      request(app)
        .post('/requests')
        .send({
          destination: 'so wrong',
          message: {
            method: 'get'
          }
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .end(done);
    });
  });
});
