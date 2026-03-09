var yi = require('../index');
var should = require('should');

describe('yi unit test', function () {

  describe('trim unit test', function () {
    it('basic', function () {
      yi.trim(' a ').should.be.exactly('a');
      yi.trim(' a b ').should.be.exactly('a b');
    });  
  });

  describe('isPlainObject unit test', function () {
    it('basic', function () {
      yi.isPlainObject({}).should.ok;
      yi.isPlainObject([]).should.not.ok;
      yi.isPlainObject(null).should.not.ok;
      yi.isPlainObject(undefined).should.not.ok;
    });
  });

  describe('isEmpty unit test', function () {
    it('basic', function () {
      (yi.isEmpty(null)).should.ok;
      (yi.isEmpty('')).should.ok;
      (yi.isEmpty(undefined)).should.ok;
      (yi.isEmpty('a')).should.not.be.ok;
      (yi.isEmpty(1)).should.not.be.ok;
      (yi.isEmpty(0)).should.not.be.ok;
    });

    it('array', function () {
      (yi.isEmpty([])).should.ok;
      (yi.isEmpty([null])).should.not.be.ok;
      (yi.isEmpty([''])).should.not.be.ok;
      (yi.isEmpty([undefined])).should.not.be.ok;
    });

    it('plain object', function () {
      (yi.isEmpty({})).should.ok;
      (yi.isEmpty({a: null})).should.not.be.ok;
    });

    it('other object', function () {
      (yi.isEmpty(new Date(''))).should.not.be.ok;
      (yi.isEmpty(arguments)).should.not.be.ok;
      (yi.isEmpty(Math)).should.not.be.ok;
      (yi.isEmpty(/a/)).should.not.be.ok;
    });    
    
  });

  describe('areEmpty and areNotEmpty', function () {

    it('basic', function () {
      should(yi.areEmpty({}, [], null, '', undefined)).be.true;
      should(yi.areEmpty({}, [], null, '', undefined, 0)).not.be.true;

      should(yi.areNotEmpty(0, new Date(), /adf/, 'a', {a:1}, [1, 'a'])).be.true;
      should(yi.areEmpty(1, /adf/, 'a', {})).not.be.true;
    });

  });

  describe('clone unit test', function () {
    var mixedHash = {
      'k1': 'v1',
      'k2': [1, 2, 3, 4],
      'k3': {
        'sub_k1': 'sub_v1',
        'sub_k2': 'sub_v2',
        'sub_k3': ['a', 'b', 'c', 'd', 'e', {
          'sub_sub_k1': 'sub_sub_v1',
          'sub_sub_k2': 'sub_sub_v2'
        }]
      }
    };

    it('basic hash clone', function () {
      var a = {'k1': 'v1', 'k2': 'v2', 'k3': 'v3'};
      var b = yi.clone(a, ['k1', 'k2']);
      var c = yi.clone(a, 'k1, k3');

      b.should.have.property('k1');
      b.should.have.property('k2');

      c.should.have.property('k1');
      c.should.have.property('k3');

    });

    it('clone has without keys defined', function () {
      var a = {'k1': 'v1', 'k2': 'v2', 'k3': 'v3'};
      var b = yi.clone(a);

      b.should.eql(a);

      b.k1 = null;
      (a.k1).should.not.be.exactly(null);
    });

    it('clone mixed object', function () {
      var b = yi.clone(mixedHash);
      var c = yi.clone(mixedHash, ['k3']);

      b.should.have.property('k1');
      b.should.have.property('k2');
      b.should.have.property('k3');

      b.k2.should.eql([1, 2, 3, 4]);
      b.k2.should.not.equal(mixedHash.k2);
      
      b.k3.should.have.property('sub_k1');
      b.k3.should.have.property('sub_k2');
      b.k3.should.have.property('sub_k3');
      
      (b.k3.sub_k3[0]).should.equal('a');
      (b.k3.sub_k3[5]).should.have.property('sub_sub_k1');

      c.should.have.property('k3');
      c.k3.should.have.property('sub_k1');
      c.k3.should.have.property('sub_k2');
      c.k3.should.have.property('sub_k3');
      
      (c.k3.sub_k3[0]).should.equal('a');
      (c.k3.sub_k3[5]).should.have.property('sub_sub_k1');

    });

    it('clone array', function () {
      var a = yi.clone(mixedHash.k2);

      (Array.isArray(a)).should.equal(true);
      a.should.eql(mixedHash.k2);
      a.should.not.exactly(mixedHash.k2);
    });

    it('clone normal value', function () {
      var v = 'v1';
      var a = yi.clone(v);
      a.should.exactly(v);
    });

    it('clone undefined value', function () {
      var un = undefined;
      var a = yi.clone(un);
      (a === undefined).should.ok;
    });

    it('clone empty hash', function () {
      var empty = {};
      var a = yi.clone(empty);

      a.should.eql({});
    });

    it('clone empty array', function () {
      var empty = [];
      var a = yi.clone(empty);

      a.should.eql([]);
    });

    it('clone empty value', function () {
      var empty = '';
      var a = yi.clone(empty);

      a.should.exactly('');
    });

    it('clone null', function () {
      var empty = null;
      var a = yi.clone(empty);

      (a === null).should.ok;
    });

  });

  describe('merge unit test', function () {

    it('basic test', function () {
      var a = {
        k1: 'a1',
        k2: 'a2'
      };
      var b = {
        k1: 'b1',
        k2: 'b2',
        k3: 'b3',
        k4:  null
      };
      var c = yi.merge(a, b);
      
      c.should.exactly(a);
      c.should.have.property('k3');
      c.k1.should.exactly('a1');
      c.k2.should.exactly('a2');
      c.k3.should.exactly('b3');
      (c.k4 === null).should.ok;  
    });

    it('test merge object into empty object', function () {
      var a = null;
      var b = {
        k1: 'b1',
        k2: 'b2',
        k3: 'b3',
        k4:  null
      };
      a = yi.merge(a, b);
      a.should.eql(b);

      a = '';
      a = yi.merge(a, b);
      a.should.eql(b);

      a = undefined;
      a = yi.merge(a, b);
      a.should.eql(b);

    });

    it('test merge empty into object', function () {
      var a = {
        k1: 'a1',
        k2: 'a2',
        k3: 'a3'
      };
      var c = yi.merge(a, null);
      c.should.exactly(a);

      c = yi.merge(a, undefined);
      c.should.exactly(a);

      c = yi.merge(a, '');
      c.should.exactly(a);

      c = yi.merge(a, 5);
      c.should.exactly(a);

    });

    it('deep merge test', function () {
      var a = {
        k1: 'a1',
        k2: {
          sub_k1: 'as1',
          sub_k2: 'as2',
          sub_k5: {
            sub_sub_k1: 'ass1'
          }
        }
      };

      var b = {
        k1: 'b1',
        k2: {
          sub_k1: 'bs1'
        }
      };

      var defaultSettings = {
        k1: 'd1',
        k2: {
          sub_k1: 'ds1',
          sub_k2: 'ds2',
          sub_k3: 'ds3',
          sub_k4: 'ds4',
          sub_k5: {
            sub_sub_k1: 'dss1',
            sub_sub_k2: 'dss2'
          }
        },
        k3: 'd3'
      };

      yi.merge(a, defaultSettings);

      a.should.have.property('k1', 'a1');
      a.should.have.property('k2');
      a.should.have.property('k3', 'd3');

      a.k2.should.have.property('sub_k1', 'as1');
      a.k2.should.have.property('sub_k2', 'as2');
      a.k2.should.have.property('sub_k3', 'ds3');
      a.k2.should.have.property('sub_k4', 'ds4');

      a.k2.should.have.property('sub_k5');

      a.k2.sub_k5.should.have.property('sub_sub_k1', 'ass1');
      a.k2.sub_k5.should.have.property('sub_sub_k2', 'dss2');

      yi.merge(b, defaultSettings);

      b.should.have.property('k1', 'b1');
      b.should.have.property('k2');
      b.should.have.property('k3', 'd3');

      b.k2.should.have.property('sub_k1', 'bs1');
      b.k2.should.have.property('sub_k2', 'ds2');
      b.k2.should.have.property('sub_k3', 'ds3');
      b.k2.should.have.property('sub_k4', 'ds4');

      b.k2.should.have.property('sub_k5', defaultSettings.k2.sub_k5);

    });
    
  });

  describe('filter unit test', function () {

    it('baisc test', function () {
      var a = {
        k1: 'a1',
        k2: 'a2',
        k3: 'a3'
      };
      var b = yi.filter(a, ['k1', 'k2', 'k3']);
      
      b.should.not.exactly(a);
      b.should.eql(a);

      b = yi.filter(a, 'k1, k2');
      b.should.have.property('k1');
      b.should.have.property('k2');
      b.should.not.have.property('k3');

    });
  });

});
