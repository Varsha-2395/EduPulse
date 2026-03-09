
var should = require('should');
var helpers = require('../libs/helpers');
//var Faker = require('../index');

describe('string/text unit test', function () {

  it('test string', function () {
    var field = {
      min: 50,
      max: 500,
      inputType: 'textarea'
    };
    var str = helpers.string(field);
    // console.log(str);

    should(str.length).within(field.min, field.max);

  });

  it('test big string', function () {
    var field = {
      min: 10000,
      max: 50000,
      inputType: 'rich_textarea'
    };
    var str = helpers.string(field);
    // console.log(str);

    should(str.length).within(field.min, field.max);

  });

  it('test big string', function () {
    var field = {
      min: 1000,
      max: 5000,
      inputType: 'rich_textarea'
    };
    var str = helpers.string(field, 'en');
    // console.log(str);

    should(str.length).within(field.min, field.max);

  });

  it('test text ', function () {
    var field = {
      inputType: 'rich_textarea'
    };
    var str = helpers.text(field, 'en');
    

    should(str.length).above(1000);

  });

});


describe('email unit test', function () {
  
  it('test email', function () {
    var str = helpers.email();
    // console.log(str);
    should(str.indexOf('@') > 0).be.true;

  });

});

describe('float unit test', function () {
  
  it('test float', function () {
    var field = {
      minValue: 100,
      maxValue: 1000,
      decimals: 3
    };
    var v, x = 100;

    do {
      v = helpers.float(field);
      // console.log(v);
      should(v).within(field.minValue, field.maxValue);
    } while (--x > 0);
    
  });

});

describe('date unit test', function () {
  
  it('test datetime', function () {
    var v, x = 10;

    do {
      v = helpers.datetime();
      // console.log(v);
      should(v).should.be.an.Date;
    } while (--x > 0);
    
  });

  it('test date', function () {
    var v, x = 10;

    do {
      v = helpers.date();
      // console.log(v);
      should(v).should.be.an.Date;
    } while (--x > 0);
    
  });

});
