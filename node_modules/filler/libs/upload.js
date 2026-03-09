module.exports = create;

var yi         = require('yi');
var fs         = require('fs');
var path       = require('path');
var rander     = require('rander');
var async      = require('async');
var utils      = require('./utils');
var Eventchain = require('eventchain');

function  create (fields, settings, default_image_resources) {
  return new Upload (fields, settings, default_image_resources);
}

function Upload (fields, settings, default_image_resources) {
  this.fields                  = fields;
  this.settings                = settings;
  this.default_image_resources = default_image_resources;
  this.fala                    = require('fala')({
    fields: fields
  });

  this.req = { files: {}};
}

Upload.prototype.forEachField = function (callback) {
  yi.forEach(this.fields, callback);
};

/**
 * fake an app for fala
 *
 *  step 1: randomly select an image file form image_resources
 *  step 2: copy the image into the tmp file
 *  step 3: make a hash object for req.files
 * 
 * @author bibig@me.com
 * @update [2014-05-24 09:23:52]
 * @return void
 *
 * req.files: { 
    image: {  
      originalFilename: '001syCSxgy6FUDE8Ugkb4.jpeg',
      path: '/var/folders/j7/lkqz298s6yn_91yhc0_fbt740000gn/T/38149-1kdtl15.jpeg',
      size: 86966,
    } 
  }
 */
Upload.prototype.run = function (callback) {
  var self = this;
  var names = Object.keys(this.fields);

  async.each(names, this.prepareForImageField.bind(this), function (e) {
    self.fala(self.req, null, callback);
  });
};

Upload.prototype.getRandomFile = function (filePath) {
  var file;

  do {
    file = rander.element(fs.readdirSync(filePath));
  } while( file.substring(0, 1) == '.');

  return file;
  
};

Upload.prototype.prepareForImageField = function (name, callback) {
  var self = this;
  var ec   = Eventchain.create();
  var image_resources = this.settings[name] || this.default_image_resources;

  // pick up a source image
  ec.add(function (sourcePath, next) {
    var sourceImageFile = path.join(sourcePath, self.getRandomFile(sourcePath));
    var file = {
      sourceImageFile  : sourceImageFile,
      originalFilename : path.basename(sourceImageFile)
    };

    fs.stat(sourceImageFile, function (e, stats) {
      file.size = stats.size;
      next(e, file);
    });
  });

  // copy to tmp file
  ec.add(function (file, next) {
    var ext              = path.extname(file.originalFilename);
    var targetImageFile  = path.join(__dirname, '../tmp/' + rander.string() + ext );


    utils.cp(file.sourceImageFile, targetImageFile, function (e) {
      file.path = targetImageFile;
      next(e, file);
    });

  });

  ec.emit(image_resources, function (e, file) {
    self.req.files[name] = file;
    callback(e);
  });

};