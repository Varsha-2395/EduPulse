var should = require('should');
var assert = require('assert');
var Xun = require('../index');


describe('test Xun object', function () {
  var records = [
    {id: 1, name: 'Tom', age: 12}, 
    {id: 2, name: 'David', age: 9}, 
    {id: 3, name: 'Cici', age: 14}
  ];

  
  it('create object', function () {
    var xun = Xun.create(records);
    
    assert.ok(typeof xun == 'object');
  });
  

  it('test [=] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('id', 2).select();
    // console.log(records);
    assert.ok(results.length == 1);
    results[0].should.have.property('id', 2);
    results[0].should.have.property('name', 'David');
  });
  

  it('test [<] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('age', '<', 10).select();
    assert.ok(results.length == 1);
  });
  
  it('test [<=] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('age', '<=', 12).select();
    // console.log(records);
    assert.ok(results.length == 2);
  });
  
  
  it('test [>=] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('age', '>=', 12).select();
    // console.log(records);
    assert.ok(results.length == 2);
  });

  
  it('test [>] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('age', '>', 12).select();
    
    assert.ok(results.length == 1);
  }); 
  
  
  it('test [not in] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 'not in', ['Tom', 'David']).order('age', 1).select('id', 'name', 'age');
    
    assert.ok(results[0].name == 'Cici');
  });
  
  it('test [in] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 'in', ['Tom']).order('age', 1).select('id', 'name', 'age');
    assert.ok(results[0].name == 'Tom');
  });
  
  it('test [between] operator', function () {
    var xun = Xun.create(records);
    var results = xun.where('age', 'between', [8, 10]).select('id', 'name', 'age');
    // console.log(results);
    assert.ok(results[0].name == 'David');
  });
  
  it('test order descend, select chain', function () {
    var xun = Xun.create(records);
    var results = xun.order('age', true).select();
    // console.log(results);
    assert.ok(results[0].age == 14);
  });
  
  it('test order ascend', function () {
    var xun = Xun.create(records);
    var results = xun.order('age').select();

    assert.ok(results[0].age == 9);
  });
  
  it('test select fields filter', function () {
    var xun = Xun.create(records);
    var results = xun.select('name', 'age');

    results[0].should.have.property('name');
    results[0].should.have.property('age');
    results[0].should.not.have.property('id');
  });
  
  it('test limit', function () {
    var xun = Xun.create(records);
    var results = xun.limit(2).select();

    assert.ok(results.length == 2);
  });
  
  it('test sum', function () {
    var xun = Xun.create(records);
    var sum = xun.where('age', '>', 9).sum('age');
    assert.ok(sum == 26);
  });
  
  it('test average', function () {
    var xun = Xun.create(records);
    var avg = xun.where('age', '>', 9).average('age');

    assert.ok(avg == 13);
  });
  
  it('test like ~%', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 'like', 'Dav%').select();

    assert.ok(results.length == 1);
    results[0].should.have.property('name', 'David');
  });
  
  it('test like %~', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 'like', '%vid').select();

    assert.ok(results.length == 1);
    results[0].should.have.property('name', 'David');
  });
  
  it('test like %~%', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 'like', '%vi%').select();

    assert.ok(results.length == 1);
    results[0].should.have.property('name', 'David');
  });
  
  it('test regex', function () {
    var xun = Xun.create(records);
    var results = xun.where('name', 're', /^\w{3}$/i).select();

    assert.ok(results.length == 1);
    results[0].should.have.property('name', 'Tom');
  });
  
  it('test filter', function () {
    var xun = Xun.create(records);
    // console.log(xun.select());
    var results = xun.filter({
      age: ['>=', 9],
      name: ['like', 'To%']
    }).select();

    assert.ok(results.length == 1);
    results[0].should.have.property('name', 'Tom');
  });
  
});