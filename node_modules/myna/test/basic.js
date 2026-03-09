
var should = require('should');

var Myna = require('../index');

describe('basic test', function () {
  var myna;

  it('define myna', function () {
    myna = Myna({
      1001: 'invalid params',
      1002: 'unknown key: %s',
      1003: 'invalid id %s found in %s'
    });
  });

  it('create error', function () {

    var err = myna.speak(1001);
    // console.log(err);
    should(err).Error;
  });

  it('create error with args', function () {

    (function () {
      throw myna.speak(1002, 'id');
    }).should.throw('unknown key: id');

    (function () {
      throw myna.speak('1003', 'foo', 'bar');
    }).should.throw('invalid id foo found in bar');

  });

  it('test with wrong args', function () {
    
    (function () {
      var error = myna.speak('none-exist');
    }).should.throw();

    (function () {
      var error = myna.speak();
    }).should.throw();

  });

  it('test getMessage', function () {
    myna.message(1001).should.equal('invalid params');
    myna.getMessage(1002, 'id').should.equal('unknown key: id');
    myna.message('1003', 'foo', 'bar').should.equal('invalid id foo found in bar');

  });

});