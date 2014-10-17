var should = require("should");
var sinon = require("sinon");
var Task = require("../lib/task");
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

describe("Task", function() {
  describe("create a task", function() {
    var t = new Task("cg-000c291ce801", request);
    it("should return Task instance when passing cg-id string", function() {
      t.should.be.instanceof(Task);
    });

    it("should return Task when passing cg-id array (length 1)",
      function() {
        var t = new Task(["cg-000c291ce801"], request);
        t.should.be.instanceof(Task);
    });

    it("should have correct properties", function() {
      t.should.have.ownProperty("id").and.be.a.Number;
      t.should.have.ownProperty("method").and.be.a.String;
      t.should.have.ownProperty("resource").and.be.a.String;
      t.should.have.ownProperty("data").and.be.a.Object;
      t.should.have.ownProperty("__destination");
      t.should.have.ownProperty("__task").and.be.a.Object;
      t.should.have.propertyByPath("__task", "createdAt");
      t.should.have.propertyByPath("__task", "finishedAt");
      t.should.have.propertyByPath("__task", "status").and.be.a.String;
      t.should.have.propertyByPath("__task", "progress").and.be.a.Number;
      t.should.have.propertyByPath("__task", "result").and.be.null;
    });
  });

  describe("create 3 tasks", function() {
    it("should return Array of Tasks when passing cg-id array" +
      "(length > 1)", function() {
      var ts = new Task(destinations, request);
      ts.should.be.instanceof(Array);
      ts.forEach(function(t) {
        t.should.be.instanceof(Task);
      });
    });
  });

  describe("dispatch tasks", function() {
    var clock;
    var ts;
    before(function () { clock = sinon.useFakeTimers(); });
    after(function () { clock.restore(); });
    beforeEach(function() {
      ts = new Task(destinations, request);
    });

    it("should be able to submit/resloved each task", function(done) {
      var doneCount = 0;
      var cb = function(err, task) {
        if (++doneCount === ts.length) {
          done();
        }
        task.__task.status.should.be.equal("resloved");
      };

      ts.forEach(function(t) {
        t.submit(cb);
      });
    });

    it("should be done and then cancel timeout timer", function(done) {
      var t = ts[0];
      var spy = sinon.spy();
      t._timeoutCallback = function() { return spy; };

      var cb = function(err, task) {
        clock.tick(36000);
        spy.called.should.be.false;
        should(err).be.null;
        task.__task.status.should.be.equal("resloved");
        done();
      };

      t.submit(cb);
    });

    it("should be timeout if task exceeds limit time", function(done) {
      var t = ts[0];
      // mock _send
      t._send = function(cb) {
        setTimeout(function() {
          cb.call(t, null, t);
        }, 36100);
      };

      var cb = function(err, task) {
        if (err) {
          task.__task.status.should.be.equal("timeout");
          done();
          return;
        }
        err.should.be.equal("timeout");
      };

      t.submit(cb);
      clock.tick(36000);
    });
  });

  describe("save/load task", function() {
    var t = new Task(destinations[0], request);
    it("should return correct properties", function() {
      var cb = function() {
        var jsonString = t.json();
        var obj = JSON.parse(jsonString);
        t.__task.should.have.ownProperty("timeoutTimer");
        obj.__task.should.not.have.ownProperty("timeoutTimer");
      };
      t.submit(cb);
    });
  });

});

describe("Job", function() {
  // Create a request to enable cellular id: 1

  describe("create an empty Job", function() {
    var j = new Job();
    it("should have correct properties", function() {
      j.should.have.ownProperty("id").and.be.a.Number;
      j.should.have.ownProperty("createdAt");
      j.should.have.ownProperty("finishedAt");
      j.should.have.ownProperty("timeout").and.be.a.Number;
      j.should.have.ownProperty("status").and.be.a.String;
      j.should.have.ownProperty("progress").and.be.a.Number;
      j.should.have.ownProperty("totalCount").and.be.a.Number;
      j.should.have.ownProperty("doneCount").and.be.a.Number;
      j.should.have.ownProperty("errorCount").and.be.a.Number;
      j.should.have.ownProperty("collection").and.be.a.Array;
    });

    it("should have collection length = 0", function() {
      j.collection.should.be.lengthOf(0);
    });
  });

  describe("create a job with 3 tasks", function() {
    var j = new Job(destinations, request);
    it("should return collection with 3 task", function() {
      j.collection.should.be.lengthOf(3);
      j.totalCount.should.be.equal(3);
    });

    it("should be able to submit all tasks and update status/progress",
      function(done) {
        var cb = function(err, job) {
          job.collection.forEach(function(task) {
            task.__task.status.should.be.equal("resloved");
          });
          job.doneCount.should.be.equal(3);
          job.errorCount.should.be.equal(0);
          job.progress.should.be.equal(100);
          done();
        };
        j.submitAll(cb);
    });
  });

  describe("submit all tasks in job with error", function() {
    it("should increase errorCount", function(done) {
      var j = new Job(destinations, request);
      j.collection[0]._send = function(cb) {
        cb("error", j.collection[0]);
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
    var j = new Job(destinations, request);
    it("should update *counts when tasks updated", function(done) {
      j.collection[0]._send = function(cb) {
        cb("error", j.collection[0]);
      };
      var spy = sinon.spy();
      var doneCb = function() {
        spy.called.should.be.true;
        done();
      };

      var updateCb = function(err, task) {
        if (err) {
          task.__task.status.should.be.equal("error");
          j.errorCount.should.not.equal(0);
        }
        spy();
      };

      j.submitAll(doneCb, updateCb);
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