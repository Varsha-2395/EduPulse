var yi = require('../index');
var should = require('should');

describe('forEach unit test', function () {

  var obj = {
    k1: 'v1',
    k2: 'v2',
    k3: 'v3',
    k4: 'v4'
  };

  it('basic', function () {
    var i = 0;

    yi.forEach(obj, function (k, v) {
      obj[k].should.eql(v);
      i++;
    });

    should(i).eql(4);

  });

  it('use array whitelist', function () {

    var results = [];

    yi.forEach(obj, function (k, v) {
      results.push(v);
    }, ['k1', 'k4', 'none-exist']);

    results.should.eql(['v1', 'v4', undefined]);
  });

  it('use function whitelist', function () {

    var results = [];

    yi.forEach(obj, function (k, v) {
      results.push(v);
    }, function (k, v) {
      return ['k2', 'k3'].indexOf(k) > -1;
    });

    results.should.eql(['v2', 'v3']);
  });

  it('bad argc', function () {

    var i = 0;

    yi.forEach(null, function (k, v) {
      i++;
    });

    yi.forEach('adsf', function (k, v) {
      i++;
    });

    yi.forEach(['a', 'b', 'c'], function (k, v) {
      i++;
    });

    yi.forEach(new Date(), function (k, v) {
      i++;
    });

    // nothing happen
    should(i).eql(0);

  });

});