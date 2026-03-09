exports.cp     = cp;
exports.cpSync = cpSync;


var fs = require('fs');

function cp(source, target, cb) {
  var cbCalled = false;
  var rd       = fs.createReadStream(source);
  var wr       = fs.createWriteStream(target);

  rd.on("error", function(e) {
    done(e);
  });
  
  wr.on("error", function(e) {
    done(e);
  });

  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(e) {
    if (!cbCalled) {
      cb(e);
      cbCalled = true;
    }
  }
}

function cpSync (source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
}