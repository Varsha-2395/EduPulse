var should     = require('should');
var Eventchain = require('../index');

describe('basic', function  () {

  var ec = Eventchain.create();
  var list = [];

  ec.add(function (sameArgs, next) { list.push(sameArgs); next(); });

  ec.add(function (sameArgs, next) { list.push(sameArgs); next(); });

  ec.add(function (sameArgs, next) { list.push(sameArgs); next(); });
  


  it('', function (done) {
    var sameArgs = 'hello';

    ec.emit(sameArgs, function (e, sameArgsToo) {
      should.not.exist(e);
      sameArgsToo.should.equal(sameArgs);
      list.should.match([sameArgs, sameArgs, sameArgs]);
      done();
    });
  });

});

describe('test args', function  () {

  var ec = Eventchain.create();
  var list = [];

  ec.add(function (s, next) { list.push(s); next(null); });

  ec.add(function (s, next) { list.push(s); next(null, 'b'); });

  ec.add(function (s, next) { list.push(s); next(); });

  ec.add(function (s, next) { list.push(s); next(null, 'c'); });

  ec.add(function (s, next) { list.push(s); next(); });

  ec.add(function (s, next) { list.push(s); next(); });

  ec.add(function (s, next) { list.push(s); next(); });
  

  it('change argc in middle events', function (done) {
    ec.emit('a', function (e, s) {
      should.not.exist(e);
      s.should.equal('c');
      list.should.match(['a', 'a', 'b', 'b', 'c', 'c', 'c']);
      done();
    });
  });

});



describe('waterfall mode', function  () {

  var ec = Eventchain.create();
  var list = [];

  ec.add(function (num, next) { list.push(num++); next(null, num); });

  ec.add(function (num, next) { list.push(num++); next(null, num); });

  ec.add(function (num, next) { list.push(num++); next(null, num); });
  


  it('', function (done) {
    ec.emit(1, function (e, num) {
      should.not.exist(e);
      num.should.equal(4);
      list.should.match([1, 2, 3]);
      done();
    });
  });

});

describe('sync mode', function  () {

  var ec = Eventchain.create();
  var list = [];

  ec.add(function (num) { list.push(num);});

  ec.add(function (num) { list.push(num);});

  ec.add(function (num) { list.push(num);});
  


  it('test sync mode', function () {
    ec.emit(1);
    list.should.match([1, 1, 1]);
  });

});

describe('throw error', function  () {

  var ec = Eventchain.create();
  var list = [];

  ec.add(function (num, next) { list.push(num++); next(new Error('error!')); });

  ec.add(function (num, next) { list.push(num++); next(null, num); });

  ec.add(function (num, next) { list.push(num++); next(null, num); });
  


  it('', function (done) {
    ec.emit(1, function (e, num) {
      should.exist(e);
      should(e).match(/error!/);
      should(num).be.empty;
      list.should.match([1]);
      done();
    });
  });

});

