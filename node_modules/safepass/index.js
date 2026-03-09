exports.hash = hash;
exports.isValid = isValid;
exports.set = set;

var rander = require('rander');
var crypto = require('crypto');


function hash (pass, length) {
  length =  length || 8;
  return _hash(pass, rander.string(length));
}

function _hash (pass, salt) {
  return salt + '.' + crypto.createHash('md5').update(pass + salt).digest('hex')
}

function isValid (pass, hashstring) {
  var salt = hashstring.split('.')[0];
  return _hash(pass, salt) == hashstring;
}


// chain way
function set (hash) {
  return {
    hash: hash,
    isValid: function (pass) {
      return isValid(pass, this.hash);
    }
  };
}