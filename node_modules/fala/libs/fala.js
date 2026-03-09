exports.create = create;

var fs      = require('fs');
var rander  = require('rander');
var path    = require('path');
var async   = require('async');
var yi      = require('yi');
var Myna    = require('myna');
var gm      = require('gm').subClass({ imageMagick: true });
var whether = require('whether').create();

function create (config, files) {
  return new Fala(config, files);
}

function checkFilePath (path, callback) {

  fs.exists(path, function (exists) {
    
    if ( ! exists ) {
      fs.mkdir(path, function (e) {
    
        if (e) {
          callback(e);
        } else {
          callback();
        }

      });
    } else {
      callback();
    }

  });
}
  
function toRandomFile (source) {
  return rander.string(6) +  path.extname(source);
}

//@isEditAction: 修改记录时，应该允许不上传文件，因为有可能只是修改其它字段
function getThumbPath (field) {
  return field.thumbPath ? field.thumbPath : path.join(field.path, 'thumbs');
}

/////////////////////////
// fala class define //
/////////////////////////

function Fala (config, files) {
  this.myna       = Myna(config.errors);
  this.files      = files || {};
  this.fields     = config.fields;
  this.data       = {};
  this.errors     = {};
}

Fala.prototype.forEachFile = function (callback) {
  yi.forEach(this.files, callback);
};

// waterfall steps:  validate -> save -> crop -> thumb
Fala.prototype.validate = function () {
  var self = this;

  this.forEachFile(function (name) {
    self.checkFile(name);
  });
  
  return Object.keys(this.errors).length === 0;
};

Fala.prototype.clear = function (callback) {
  var self = this;

  async.each(Object.keys(this.files || {}), function(name, next) {
    var file = self.files[name];
    
    fs.unlink(file.path, next);
  }, callback);

};

Fala.prototype.getValidFiles = function () {
    var valids = [];

    this.forEachFile(function (name, file) {
      if (file.originalFilename === '' || file.size === 0) { return; }

      valids.push(name);
    });

    return valids;
};


/**
 * save all uploaded files
 *
 * should be used after validate()
 * and should use valided files.
 * when no file choosed to upload, express will also create an empty tmp file for it.
 *  use this empty tmp file, gm will emit ENOENT error.

 * @author bibig@me.com
 * @update [date]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Fala.prototype.save = function (callback) {
  var self = this;
  
  var filenames = this.getValidFiles(); 
  
  async.each(filenames, function(name, callback) {
    
    async.series([
      function (callback) {
        var field = self.fields[name];
        
        checkFilePath(field.path, callback);
      },
      function (callback) {
        self.moveImage(name, callback);
      },
      function (callback) {
        self.trimImage(name, callback);
      },
      function (callback) {
        var field = self.fields[name];

        if (field.thumbs) {
          self.thumbImages(name, callback);
        } else if (field.thumbSize) {
          self.thumbImage(name, callback);
        } else {
          callback();
        }
        
      }
    ], callback); // end of async.series
      
  }, callback); // end of async.each
};

Fala.prototype.moveImage = function (name, callback) {
  var file           = this.files[name];
  var field          = this.fields[name];
  var targetFileName = toRandomFile(file.path);
  var targetFile     = path.join(field.path, targetFileName);
  var self          = this;
  
  fs.rename(file.path, targetFile, function (e) {

    if (e) {
      callback(e);
    } else {
      self.data[name] = targetFileName;

      if (field.sizeField) {
        self.data[field.sizeField] = file.size;
      }

      callback();
    }
  });
};

Fala.prototype.trimImage = function (name, callback) {
  var field       = this.fields[name];
  var targetImage = path.join(field.path, this.data[name]);
  var imageSize   = field.imageSize;
  var gravities , gravity, imgObj;
  
  if (typeof imageSize == 'number') {
    imageSize = [imageSize];
  }
  
  if (Array.isArray(imageSize)) {
    imgObj = gm(targetImage);

    if (field.cropImage) {
      gravities = ['NorthWest', 'North', 'NorthEast', 'West', 'Center', 'East', 'SouthWest', 'South', 'SouthEast'];
      gravity = gravities.indexOf(field.cropImage) > -1 ? field.cropImage : 'North';
      imgObj = imgObj.gravity(gravity).crop(imageSize[0], imageSize[1]);
    } else {

      if (field.isFixedSize) {
        imgObj = imgObj.resize(imageSize[0], imageSize[1], '!');
      } else {

        if (imageSize.length == 2) {
          imgObj = imgObj.resize(imageSize[0], imageSize[1]);
        } else {
          imgObj = imgObj.resize(imageSize[0]);
        }

      }
    }
    
    imgObj.write(targetImage, callback);

  } else {
    callback();
  }
};

Fala.prototype.thumbImage = function (name, callback) {
  var field          = this.fields[name];
  var thumbPath      = getThumbPath(field);
  var source = path.join(field.path, this.data[name]);
  var thumb  = path.join(thumbPath, this.data[name]);
  
  checkFilePath(thumbPath, function (e) {
    if (e) { callback(e); } else {
      makeThumb(source, thumb, field.thumbSize, callback);
    }
  });
};

Fala.prototype.thumbImages = function (name, callback) {
  var field          = this.fields[name];
  var thumbPath      = getThumbPath(field);
  var source = path.join(field.path, this.data[name]);
  var info           = this.data[name].split('.');
  
  checkFilePath(thumbPath, function (e) {
    if (e) { callback(e); } else {

      async.eachSeries(field.thumbs, function (thumbSize, callback) {
        var thumb = path.join(thumbPath, info[0] + '_' + thumbSize + '.' + info[1]);

        makeThumb(source, thumb, thumbSize, callback);
      }, callback);
      
    }
  });
};

Fala.prototype.checkFile = function (name) {
  var field = this.fields[name];
  var file, ext;

  if (! field) {
    throw this.myna.speak(99, name);
  }

  file = this.files[name];

  if (file.originalFilename === '') {
    if (field.required || field.isRequired) {
      this.errors[name] = this.myna.message(100);
    }
    return;
  }

  if (file.size === 0 ) {
    if (field.required || field.isRequired) {
      this.errors[name] = this.myna.message(106);
    }
    return;
  }

  if (file.originalFilename.indexOf('.') == -1) {
    this.errors[name] = this.myna.message(105);
    return;
  }

  ext = path.extname(file.path).substring(1);
  
  if ((field.exts || []).indexOf(ext) == -1) {
    this.errors[name] = this.myna.message(102, ext);
    return;
  }

  if ( field.isImage && ! whether(file.path).isMatched()) {
    this.errors[name] = this.myna.message(101, file.originalFilename);
    return;
  }
  
  if (field.minFileSize && field.minFileSize > file.size) {
    this.errors[name] = this.myna.message(104, yi.humanSize(field.minFileSize));
    return;
  }

  if (field.maxFileSize && field.maxFileSize < file.size) {
    this.errors[name] = this.myna.message(103, yi.humanSize(field.maxFileSize));
    return;
  }
};

function makeThumb (targetImage, thumbImage, size, callback) {

  if ( ! Array.isArray(size)) {
    size = (size + '').split('x');
  }

  gm(targetImage)
    .resize(size[0], size[1])
    .write(thumbImage, callback);
}