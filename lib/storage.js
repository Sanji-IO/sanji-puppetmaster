var crypto = require("crypto");
var fs = require("fs"); 

var driver = {
  memory: (function() {
    var data;
    return {
      save: function(obj) {
        data = obj;
      },
      load: function() {
        return data;
      }
    };
  })(),

  file: (function() {
    var _filename;
    var generateName = function() {
      return "puppetmaster_" + crypto.randomBytes(4).readUInt32LE(0) + ".tmp";
    };
    return {
      save: function(obj, filename) {
        _filename = filename || generateName();
        try {
          JSON.parse(obj);
        } catch (e) {
          obj = JSON.stringify(obj);
        }
        fs.writeFileSync(this.connection.path + "/" + _filename, obj);
        return this.connection.path + "/" + _filename;
      },
      load: function(filename) {
        var s = fs.readFileSync(filename);
        try {
          return JSON.parse(s);
        } catch(e) {
          return s;
        }
      }
    };
  })()
};

var Storage = function(options) {
  if (options === undefined) {
    options = {
      connection: {
        path: null,
        type: "memory"
      }
    };
  } else if (typeof options === "string") {
    options = {
      connection: {
        path: options,
        type: "file"
      }
    };
  }

  this.connection = options.connection;
  var currentDriver = driver[this.connection.type];
  for (var prop in currentDriver) {
    if (!currentDriver.hasOwnProperty(prop)) {
      continue;
    }
    this[prop] = currentDriver[prop];
  } 
};

module.exports = Storage;