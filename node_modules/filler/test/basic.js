var path   = require('path');
var should = require('should');

var utils  = require('./fixtures/utils');
var PATH   = path.join(__dirname, 'basic-test');
var Filler = require('../index');
var fs     = require('fs');
var can, filler;

var imagesPath = path.join(__dirname, './fixtures/uploads');
var thumbsPath = path.join(__dirname, './fixtures/uploads/thumbs');

var times = function (x, fn) {
  do { fn(); } while(--x > 0);
};

var cats = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'];

function init () {
  can   = require('./fixtures/can')(PATH);
  filler = new Filler(can, {
    reset    : true,
    lang     : 'cn',
    images   : path.join(__dirname, './fixtures/images'),
    quantity : {
      site              :  1,
      articleCategories : 20,
      articles          : 50,
      articleImages     : 10
    },
    tables: {
      articleCategories : {
        name: cats
      }

    }
  });
}

describe('filler test', function () {
  

  this.timeout(15000);

  before(function () {
    init();
  });

  after(function (done) {
    utils.clear(PATH, done);
  });

  it('test assemble', function () {

    times(10, function () {
      var data = filler.assemble('site');
      
      //console.log(data);
      data.should.have.property('adminUser');
      data.should.have.property('adminPassword');
      data.should.have.property('adminRole');

      data.adminUser.should.match(/[a-zA-Z0-9]{3,10}/);
      data.adminPassword.should.match(/[0-9]+/);
      should(['root', 'adminitrator', 'user', 'editor'].indexOf(data.adminRole) > -1 ).be.ok;
    });

  });

  it('test fill site', function (done) {
    filler.fill('site', function (e) {
      should.not.exist(e);
      done();
    });    
  });

  it(' articleCategories table test', function () {

    times(10, function () {
      var data = filler.assemble('articleCategories');

      // console.log(data);
      
      data.should.have.property('seq');
      data.should.have.property('name');
      should(cats.indexOf(data.name) > -1).be.ok;
      (data.name.length).should.within(0, 50);
      data.seq.should.within(0, 19);

    });

  });

  it('test fill articleCategories', function (done) {
    filler.fill('articleCategories', function (e) {
      should.not.exist(e);
      done();
    });
  });

  it('test getReferenceTableIds', function () {
    var ids = filler.getReferenceTableIds('articles', '_articleCategory');

    // console.log(ids);

    ids.length.should.eql(20);
    ids.forEach(function (record) {
      record.should.have.property('_id');
    });
    
  });

  it('articles table test', function () {

    times(10, function () {
      var data = filler.assemble('articles');

      // console.log(data);

      data.should.have.property('_articleCategory');
      data.should.have.property('title');
      data.should.have.property('summary');
      data.should.have.property('content');

    });

  });

  it('test fill articles', function (done) {
    filler.fill('articles', function (e) {
      should.not.exist(e);
      done();
    });    
  });

  it('test fill articleImages', function (done) {
    filler.fill('articleImages', function (e) {
      should.not.exist(e);
      done();
    });    
  });

  it('check upload images', function () {
    fs.readdirSync(imagesPath).length.should.eql(10 + 1); // don't forget the thumbs fold
    fs.readdirSync(thumbsPath).length.should.eql(20);
  });

  it('clear test images', function (done) {
    utils.clear(imagesPath + '/*', done);
  });

  it('clear thumbs images', function (done) {
    utils.clear(thumbsPath + '/*', done);
  });

  it('check db', function () {
    var site = can.open('site').query().execSync();
    var articles = can.open('articles').query().execSync();
    
    should(site.length).eql(1);
    should(articles.length).eql(50);

  });

});
