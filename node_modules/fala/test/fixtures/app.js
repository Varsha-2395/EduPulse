var path  = require('path');
var glory = require('glory')({
  path      : __dirname,
  cookie    : false,
  session   : false,
  csrf      : false,
  multipart : {
    uploadDir: path.join(__dirname, '../../tmp')
  }
});
var imagePath = path.join(__dirname, './public/uploads');

var fala = require('../../index')({
  fields: {
    image: {
      required: true,
      isImage: true,
      path: imagePath, 
      url: '/uploads/',
      maxFileSize: 70000,
      exts: ['jpg', 'jpeg', 'gif', 'png'],
      sizeField: 'size',
      // cropImage: 'Center',
      // isFixedSize: true,
      imageSize: [600, 400],
      thumbSize: [100],
      thumbPath: false // use default
    },
    image2: {
      isImage: true,
      path: imagePath, 
      url: '/uploads/',
      maxFileSize: 70000,
      exts: ['jpg', 'jpeg', 'gif', 'png'],
      sizeField: 'size2',
      cropImage: 'Center',
      isFixedSize: true,
      imageSize: [600, 400],
      // thumbSize: [100],
      thumbs: ['150x150', '80x80'],
      thumbPath: false // use default
    } 
  }

});

glory.getImagePath = function (file) {
  return path.join(imagePath, file);
};

glory.getThumbPath = function (file, size) {
  var info;

  if (! size) {
    return path.join(imagePath, 'thumbs', file);  
  } else {
    info = file.split('.');

    return path.join(imagePath, 'thumbs', info[0] + '_' + size + '.' + info[1]);  
  }
  
};


glory.app.all('/upload', fala, function (req, res, next) {
  
  res.json(req.fala);

});

module.exports = glory;