exports.numeric      = numeric;
exports.alphanumeric = alphanumeric;
exports.text         = text;
exports.string       = string;
exports.integer      = integer;
exports.float        = float;
exports.email        = email;
exports.date         = date;
exports.datetime     = datetime;
exports.timestamp    = timestamp;

var rander = require('rander');

function alphanumeric (field) {
  var size = field.size || rander.between(field.min || 1, field.max || 100);

  return rander.string(size);
}

function numeric (field) {
  var size = field.size || rander.between(field.min || 1, field.max || 100);

  return rander.number(size); 
}

function text (field, lang) {
  var str = '';
  var mice = require('mice')(lang || 'cn');
  var min = field.min || 0;
  var max = field.max;
  var size = rander.between(5, 25);

  function tail (inputType) {
    switch (inputType) {
      case 'rich_textarea':
        return mice.paragraphs(size, ['<p>', '</p>']);
      default:
        return mice.paragraphs(size);
    }  
  }

  str += tail(field.inputType);

  if (min) {
    while (str.length < min) {
      str += tail(field.inputType);
    }  
  }

  if (max) {
    if (str.length > max) {
      str = str.substring(0, max - 1);
    }  
  }

  return str;
}


function string (field, lang) {
  var str = '';
  var mice = require('mice')(lang || 'cn');
  var min = field.min || 1;
  var max = field.max || 1500;

  if (field.dictionary) {
    return rander.pickup(rander.between(min, max), field.dictionary);
  }

  function tail (inputType) {
    switch (inputType) {
      case 'rich_textarea':
        return mice.paragraphs(3, ['<p>', '</p>']);
      case 'textarea':
        return mice.sentences(3);
      default:
        return mice.sentence();
    }  
  }

  while (str.length < min) {
    str += tail(field.inputType);
  }

  if (str.length > max) {
    str = str.substring(0, max - 1);
  }

  return str;
}

function integer (field) {
  var min, max, decimals, tmp ;

  min = field.minValue || 0 ;
  max = field.maxValue || 100;
  decimals = field.decimals || 2;
  tmp = decimals * 10;

  return rander.between(min, max);
}

function float (field) {
  var min, max, decimal, v;

  min = field.minValue || 0 ;
  max = field.maxValue || 100;
  decimals = field.decimals || 2;

  v = Math.pow(10, decimals);
  return parseInt(rander.between(min * v, max * v), 10) / v; 
}

function email () {
 var domain = ['me.com', 'google.com', 'qq.com', 'facebook.com', 'yahoo.com', 'live.com', 'hotmail.com']; 

 return rander.string(rander.between(3, 10)) + '@' + rander.ele(domain);
}

function date () {
  var currentYear = new Date().getFullYear();
  var y = rander.between(currentYear - 20, currentYear);
  var m = rander.dice(11);
  var d = rander.dice(31);

  return new Date(y, m, d);
}

function datetime () {
  var currentYear = new Date().getFullYear();
  var y           = rander.between(currentYear - 20, currentYear);
  var m           = rander.dice(11);
  var d           = rander.dice(31);
  var hh          = rander.dice(59);
  var mm          = rander.dice(59);
  var ss          = rander.dice(59);

  return new Date(y, m, d, hh, mm, ss);
}

function timestamp () {
  return datetime().getTime();
}
