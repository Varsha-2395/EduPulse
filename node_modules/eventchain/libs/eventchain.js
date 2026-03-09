var Event = require('events').EventEmitter;
var event = new Event();

var Eventchain = function (name) {
  
  if (name) {
    this.name = name;
    this.isOnce = false;
  } else {
    this.name = randomName();
    this.isOnce = true;
  }
  this.count = 0;
  this.current = 0;
  // this.results = [];
 };
 
function randomName (len) {
  return require('crypto').randomBytes(len || 8).toString('hex');
}

/**
 * the callback arguments should include `args` and `next`;
 * eg: function(record, next) {...};
 */
Eventchain.prototype.add = function (callback) {
  event.on(this.eventName(), callback);
  this.count++;
};

Eventchain.prototype.eventName = function (count) {
  count = count === undefined ? this.count : count;
  return [this.name, count].join('#');
};

Eventchain.prototype.clear = function () {
  for (var i = 0; i < this.count; i++) {
    event.removeAllListeners(this.eventName(i));
  }
};

Eventchain.prototype.clearOnce = function () {
  if (this.isOnce) {
    this.clear();
  }
};

Eventchain.prototype.isDone = function () {
  return this.current >= this.count;
};

Eventchain.prototype.reset = function () {
  this.current = 0;
};

Eventchain.prototype.emit = function (args, callback) {
  var self = this;
  var next;
  
  if (!callback) {
    this.emitSync(args);
    return;
  }
  
  if (this.count === 0 || this.isDone()) { 
    this.reset();
    this.clearOnce();
    callback(null, args);
    return;
  }
  
  next = function (e) {
    var nextArgs = [];

    if (e) {
      self.clearOnce();
      callback(e);
    } else {
      if (arguments.length <= 1) {
        nextArgs = args;
      } else if (arguments.length == 2) {
        nextArgs = arguments[1];
      } else {
        for (var i = 1; i < arguments.length; i++) {
          nextArgs.push(arguments[i]);
        }
      }
    
      self.current++;
      self.emit(nextArgs, callback);
    }
  };
  
  event.emit(this.eventName(this.current), args, next);
  
}; // end of emit

Eventchain.prototype.emitSync = function (args) {
  
  if (this.count === 0 || this.isDone()) { 
    this.reset();
    return;
  }
  
  event.emit(this.eventName(this.current), args);
  this.current++;
  this.emitSync(args);
};

module.exports = exports = Eventchain;