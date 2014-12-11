var should = require("should");
var sinon = require("sinon");
var Request = require("../lib/request");
var Job = require("../lib/job");
var Storage = require("../lib/storage");

var request = {
  id: 1,
  method: "post",
  resource: "/network/cellular/1",
  data: {
    enable: 1
  }
};

var destinations = ["cg-000c291ce801", "cg-000c291ce802", "cg-000c291ce803"];

describe("Request", function() {
  describe("create a request", function() {
    var t = new Request({destination: "cg-000c291ce801", message: request});
    it("should return Request instance when passing cg-id string", function() {
      t.should.be.instanceof(Request);
    });

    it("should have correct properties", function() {
      t.should.have.ownProperty("id").and.be.a.Number;
      t.should.have.ownProperty("method").and.be.a.String;
      t.should.have.ownProperty("resource").and.be.a.String;
      t.should.have.ownProperty("data").and.be.a.Object;
      t.should.have.ownProperty("__request").and.be.a.Object;
      t.should.have.propertyByPath("__request", "destination");
      t.should.have.propertyByPath("__request", "createdAt");
      t.should.have.propertyByPath("__request", "finishedAt");
      t.should.have.propertyByPath("__request", "status").and.be.a.String;
      t.should.have.propertyByPath("__request", "progress").and.be.a.Number;
      t.should.have.propertyByPath("__request", "result").and.be.null;
    });
  });


  describe("dispatch a request", function() {
    var clock, ts;

    before(function () { clock = sinon.useFakeTimers(); });
    after(function () { clock.restore(); });

    beforeEach(function() {
      ts = new Request({destination: destinations[0], message: request});
    });

    it("should be able to submit/resloved", function(done) {
      var cb = function(err, request) {
        request.__request.status.should.be.equal("resloved");
        done(err);
      };

      ts.submit(cb);
    });

    it("should be done and then cancel timeout timer", function(done) {
      var spy = sinon.spy();
      ts._timeoutCallback = function() { return spy; };

      var cb = function(err, request) {
        clock.tick(36000);
        spy.called.should.be.false;
        should(err).be.null;
        request.__request.status.should.be.equal("resloved");
        done();
      };

      ts.submit(cb);
    });

    it("should be timeout if request exceeds limit time", function(done) {
      // mock _send
      ts._send = function(cb) {
        setTimeout(function() {
          cb.call(ts, null, ts);
        }, 36100);
      };

      var cb = function(err, request) {
        if (err) {
          request.__request.status.should.be.equal("timeout");
          done();
          return;
        }
        err.should.be.equal("timeout");
      };

      ts.submit(cb);
      clock.tick(36000);
    });
  });

  describe("to json", function() {
    var t = new Request({destination: destinations[0], message: request});
    it("should return correct properties", function() {
      var cb = function() {
        var obj = t.toJSON();
        t.__request.should.have.ownProperty("timeoutTimer");
        obj.__request.should.not.have.ownProperty("timeoutTimer");
      };
      t.submit(cb);
    });
  });
});

describe("Job", function() {
  var vaildFunc = function(j) {
    j.should.have.ownProperty("id").and.be.a.Number;
    j.should.have.ownProperty("createdAt");
    j.should.have.ownProperty("finishedAt");
    j.should.have.ownProperty("timeout").and.be.a.Number;
    j.should.have.ownProperty("status").and.be.a.String;
    j.should.have.ownProperty("progress").and.be.a.Number;
    j.should.have.ownProperty("totalCount").and.be.a.Number;
    j.should.have.ownProperty("doneCount").and.be.a.Number;
    j.should.have.ownProperty("errorCount").and.be.a.Number;
    j.should.have.ownProperty("requests").and.be.a.Array;
  };

  // Create a request to enable cellular id: 1
  describe("create an empty one", function() {
    var j = new Job();
    it("should have correct properties", function() {
      vaildFunc(j);
    });

    it("should have collection length = 0", function() {
      j.requests.should.be.lengthOf(0);
    });
  });

  describe("create a job with a single request", function() {
    var j = new Job({destinations: "cg-000c291ce801", message: request});
    it("should return collection with 1 request", function() {
      j.requests.should.be.lengthOf(1);
      j.totalCount.should.be.equal(1);
    });

    it("should be able to submit all requests and update status/progress",
      function(done) {
        var cb = function(err, job) {
          should(err).be.null;
          job.requests[0].__request.status.should.be.equal("resloved");
          job.doneCount.should.be.equal(1);
          job.errorCount.should.be.equal(0);
          job.progress.should.be.equal(100);
          done();
        };
        j.submitAll(cb);
    });
  });

  describe("create a job with 3 requests", function() {
    var j = new Job({destinations: destinations, message: request});
    it("should return collection with 3 request", function() {
      j.requests.should.be.lengthOf(3);
      j.totalCount.should.be.equal(3);
    });

    it("should be able to submit all requests and update status/progress",
      function(done) {
        var cb = function(err, job) {
          should(err).be.null;
          job.requests.forEach(function(request) {
            request.__request.status.should.be.equal("resloved");
          });
          job.doneCount.should.be.equal(3);
          job.errorCount.should.be.equal(0);
          job.progress.should.be.equal(100);
          done();
        };
        j.submitAll(cb);
    });
  });

  describe("submit all requests in job with error", function() {
    it("should increase errorCount", function(done) {
      var j = new Job({destinations: destinations, message: request});
      j.requests[0]._send = function(cb) {
        cb("error", j.requests[0]);
      };

      var cb = function(err, job) {
        job.doneCount.should.be.equal(3);
        job.errorCount.should.be.equal(1);
        job.progress.should.be.equal(100);
        done();
      };

      j.submitAll(cb);
    });
  });

  describe("update status immediately", function() {
    var j = new Job({destinations: destinations, message: request});
    it("should update *counts when requests updated", function(done) {
      j.requests[0]._send = function(cb) {
        cb("error", j.requests[0]);
      };
      var spy = sinon.spy();
      var doneCb = function() {
        spy.called.should.be.true;
        done();
      };

      var updateCb = function(err, request) {
        if (err) {
          request.__request.status.should.be.equal("error");
          j.errorCount.should.not.equal(0);
        }
        spy();
      };

      j.submitAll(doneCb, updateCb);
    });
  });

  describe("to json", function() {
    var j = new Job({destinations: destinations, message: request});
    it("should return json string", function() {
      var obj = j.toJSON();
      vaildFunc(obj);
    });
  });

  describe("save/load", function() {
    var j = new Job({destinations: destinations, message: request});
    var filename;
    it("should be able to save as a file", function() {
      filename = j.save("/tmp");
    });

    it("should be able to load as a file", function() {
      j.load(filename);
    });

  });

});

describe("Storage", function() {
  describe("create a storage instance (memory)", function() {
    var s = new Storage();
    it("should be created as a storage instance", function() {
      s.should.be.a.Storage;
      s.connection.type.should.be.equal("memory");
    });

    it("should be able to save/load", function() {
      s.save("123");
      s.load().should.be.equal("123");
    });
  });

  describe("create a storage instance (file)", function() {
    var s = new Storage("/tmp");
    it("should be created as a storage instance", function() {
      s.should.be.a.Storage;
      s.connection.type.should.be.equal("file");
    });

    it("should be able to save/load", function() {
      var obj = {"dummy": "this is a dummy object"};
      var filename = s.save(obj);
      s.load(filename).should.be.containEql(obj);
    });
  });

});
