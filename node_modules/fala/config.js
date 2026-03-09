module.exports = create;

var yi     = require('yi');
var Config = {
  errors: {
    99  : '非法的上传文件, 缺失对<%s>的定义',
    100 : '请上传文件',
    101 : '不能识别的图片, 源文件: %s',
    102 : '不支持"%s"文件类型',
    103 : '文件太大, 文件最大限制"%s"',
    104 : '文件太小, 文件最小"%s"',
    105 : '文件缺失扩展名',
    106 : '请上传非空文件'
  }
};

function  create (settings) {
  return yi.merge(settings, yi.clone(Config));
}