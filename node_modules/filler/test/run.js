var path   = require('path');
var should = require('should');

var utils  = require('./fixtures/utils');
var PATH   = path.join(__dirname, 'basic-test');
var Filler = require('../index');
var fs     = require('fs');
var can, filler;

var imagesPath = path.join(__dirname, './fixtures/uploads');
var thumbsPath = path.join(__dirname, './fixtures/uploads/thumbs');

function init () {
  can   = require('./fixtures/can')(PATH);
  filler = new Filler(can, {
    lang: 'cn',
    images: path.join(__dirname, './fixtures/images'),
    quantity: {
      site              :  1,
      articleCategories : 20,
      articles          : 50,
      articleImages     : 10
    },
    tables: {
      
    }
  });
}

describe('filler whole db', function () {
  
  this.timeout(15000);

  before(function () {
    init();
  });

  after(function (done) {
    utils.clear(PATH, done);
  });

  it('test run', function (done) {

    filler.run(function (e) {
      should.not.exist(e);
      done();
    });

  });

  it('test result', function () {
    var site              = can.open('site').query().execSync();
    var articleCategories = can.open('articleCategories').query().execSync();
    var articles          = can.open('articles').query().execSync();
    var articleImages     = can.open('articleImages').query().execSync();
    // console.log(site);
    // console.log(articleCategories);
    // console.log(articles);

    should(site.length).eql(1);
    should(articleCategories.length).eql(20);
    should(articles.length).eql(50);
    should(articleImages.length).eql(10);

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
  
});