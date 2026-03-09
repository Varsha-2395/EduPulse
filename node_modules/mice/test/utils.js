var utils = require('../libs/utils');
var should = require('should');

describe('utils unit test', function () {

  it('test pickup_by_probability', function () {
    var obj = {
      10: '!',
      100: '?'
    };
    var results = {'!': 0, '?': 0};
    var t, x;
    t = x = 10000;

    while(--x > 0) {
      results[utils.pickup_by_probability(obj)]++;
    }

    console.log(results);
    
    should(results['!']/t).be.approximately(0.1, 0.03);
    should(results['?']/t).be.approximately(0.9, 0.03);

  });

});