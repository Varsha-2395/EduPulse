var rander = require('rander');
var should = require('should');
var assert = require('assert');
var safepass = require('../index');

describe('safepass module test', function () {
  var passwords = [];
  var hashs;
  var count = 10;
  
  before(function (done) {
    for (var i = 0; i < count; i++) {
      passwords.push(rander.string(10));
    }
    // console.log(passwords);
    done();
  });

  it('should hash password', function () {
    hashs = passwords.map(function (pass) {
      // console.log(pass);
      var hash = safepass.hash(pass);
      assert.ok(hash.indexOf('.') > 1);
      assert.ok(hash.length > pass.length);
      assert.ok(typeof hash == 'string');
      return hash;
    });
    // console.log(hashs);
  });
  
  it('isValid should work', function () {
    hashs.forEach(function (hash, i) {
      assert.ok(safepass.isValid(passwords[i], hash));
    });
  });
  
  
  it('test null value', function () {
    hash = safepass.hash('');
    // console.log(hash);
    assert.ok(safepass.isValid('', hash));
  });
  
  it('test chain way', function () {
    password = 'im password';
    hash = safepass.hash(password);
    assert.ok(safepass.set(hash).isValid(password));
    // null password test if null password is valid.
    assert.ok(safepass.set(safepass.hash('')).isValid(''));
  });
  
});