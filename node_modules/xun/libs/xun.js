
exports.create  = create;
exports.isMatch = isMatch;

var util = require('util');
var myna = require('myna')({
  'x001': 'Invalid <like> value: [%s], only support:[%key, key%, %key%].',
  'x002': 'Unsupported operator: [%s].',
  'x003': 'Invalid regex object: [%s].'
});


/**
 * 创建查询对象
 * @records: 原始数据，array
 * @return Object
 */
function create (records) {
  return new Xun(records);
}

function isMatch (hash, options) {
  var keys = Object.keys(options  || {});

  function _isMatch (value, options) {
    var operator, compareValue;
    
    if (Array.isArray(options)) {
      operator = options[0];
      compareValue = options[1];
    } else {
      operator = '=';
      compareValue = options;
    }
    // console.log('%s %s %s', value, operator, compareValue);
    return compare(value, operator, compareValue);
  }


  for (var i = 0; i < keys.length; i++) {
  
    if ( ! _isMatch(hash[keys[i]], options[keys[i]])) {
      return false;
    }

  }

  return true;  
}

//-----------------------begin----------------------------
//////////////////
// Xun construction //
//////////////////

function Xun (records) {
  this.records = records;
}

// 是否有记录存在
Xun.prototype.isEmpty = function () {
  return this.records.length > 0;
};

Xun.prototype.key = function (name) {
  var list = [];

  this.records.forEach(function (record) {
    list.push(record[name]);
  });

  return list;
};

/**
 * 选择字段
 * @_fields: 特别指定的字段，为空表示全选
 * @return array
 * examples:
 *  1. select()
 *  2. select('id, name, age')
 *  3. select(id, name, age)
 *  4. selelct(['id', 'name', 'age'])
 */
Xun.prototype.select = function (/*fields*/) {
  var fields;
  var selectFn = function (records, fields) {
    var list = [];

    records.forEach(function (record) {
      var newRecord = {};

      fields.forEach(function (field) {
        newRecord[field] = record[field];
      });

      list.push(newRecord);
    });

    return list;
  };

  if (arguments.length > 1) {
    fields = [];

    for (var i = 0; i < arguments.length; i++) {
      fields.push(arguments[i]);
    }

  } else if (arguments.length == 1) {
    fields = arguments[0];
  }
  
  if (typeof fields === 'string') {
    fields = fields.replace(/[\s]/g, '').split(','); // 支持select('id, name, age');
  }
  
  if ( ! fields ) {
    return this.records;
  }
  
  if (Array.isArray(fields)) {
    return selectFn(this.records, fields);
  }
  
  return this.records;
};

/**
 * 求和
 * @field: 字段名
 * @return this
 */
Xun.prototype.sum = function (field) {
  var s = 0;

  this.records.forEach(function (record) {
      s += record[field] || 0;
  });
  
  return s;
};

/**
 * 返回记录数
 */
Xun.prototype.count = function () {
  return this.records.length;
};

/**
 * 求平均数
 * @field: 字段名
 * @return this
 */
Xun.prototype.average = function (field) {
  var s = this.sum(field);

  return s / this.records.length;
};


/**
 * 限制输出列表数
 * @n: 个数
 * @return this
 */
Xun.prototype.limit = function (n) {
  var list = [];
  var max  = this.records.length;
  
  if (n > max) {
    n = max;
  }
  
  for (var i = 0; i < n; i++) {
    list.push(this.records[i]);
  }
  
  this.records = list;
  
  return this;
};

/**
 * 跳跃指定数目的记录
 * @n: 个数，从1开始
 * @return this
 */

Xun.prototype.skip = function (n) {
  var list = [];
  var max = this.records.length;
  
  if (n < max) {

    for (var i = n; i < max; i++) {
      list.push(this.records[i]);
    }

  } 
  
  this.records = list;

  return this;
};

/**
 * 排序
 * @field: 字段名
 * @isDescend: 是否倒序
 * @return this
 */
Xun.prototype.order = function (field, isDescend) {

  if (this.records.length > 0) {

    this.records.sort(function (a, b) {
      // return isDescend ? ( a[field] - b[field] ) : ( a[field] - b[field] );
      if (a[field] < b[field]) {
        return isDescend ? 1 : -1;
      }

      if (a[field] > b[field]) {
        return isDescend ? -1 : 1;
      }

      return 0;

    });

  }

  return this;
};

/**
 * 比较值是否符合要求
 *
 * examples:
 *    where('id', 1000)
 *    where('age', '>', 10])
 *    where('name', 'in', ['Tom', 'Peter', 'Kim'])
 *    where('name', 'not in' ['David', 'Rose', 'Cici'])
 *    where('age', 'between', [3, 6])
 *    where('name', 'like', '%vid');
 *
 * @field: 要进行比较的字段名
 * @return records 符合要求的记录列表
 */
Xun.prototype.where = function (field/*, operator, value|values*/) {
  var operator, value;
  var list = [];
  
  if (arguments.length == 2) {

    if (Array.isArray(arguments[1])) {
      operator = arguments[1][0];
      value = arguments[1][1];
    } else {
      operator = '=';
      value = arguments[1];
    }

  } else if (arguments.length == 3) {
    operator = arguments[1];
    value = arguments[2];
    
  } else {
    return this;
  }
  
  this.records.forEach(function (record) {
    
    if (compare(record[field], operator, value)) {
      list.push(record);
    }

  });
  
  this.records = list;

  return this;
};

Xun.prototype.filter = function (options) {
  var _this = this;
  var keys = Object.keys(options  || {});
  
  keys.forEach(function (key) {
    var params = [key];

    if (util.isArray(options[key])) {
      
      options[key].forEach(function (param) {
        params.push(param);
      });

    } else {
      params.push(options[key]);
    }

    _this = _this.where.apply(_this, params);
  });

  return _this;  
};

//-----------------------over----------------------------

/**
 * 比较值是否符合要求
 * @fieldValue: 字段值
 * @operator: 比较运算符
 * @value： 比较值
 * @return boolean
 */
function compare (fieldValue, operator, value) {
  var i;

  switch(operator.toLowerCase()) {
    case '=':
      return fieldValue == value;
    case '>=':
      return fieldValue >= value;
    case '>':
      return fieldValue > value;
    case '<':
      return fieldValue < value;
    case '<=':
      return fieldValue <= value;
    case '<>':
    case '!=':
      return fieldValue != value;
    case 'in':
      for (i = 0; i < value.length; i++) {

        if (fieldValue == value[i]) {
          return true;
        }

      }
      return false;
    case 'not in':
      for (i = 0; i < value.length; i++) {

        if (fieldValue == value[i]) {
          return false;
        }

      }
      return true;
    case 'between':
      return fieldValue > value[0] && fieldValue < value[1];
    case 're':
    case 'regex':

      if (util.isRegExp(value)) {
        return value.test(fieldValue);  
      } else {
        throw myna.speak('x003', value);
      }

      break;
    case 'like': // 必须包含%
      var pattern1 = /^%[^%]+$/i;  // %开头
      var pattern2 = /^[^%]+%$/i;  // %结尾
      var pattern3 = /^%[^%]+%$/i; // %包围
      var key = value.replace(/%/g, '');
      var index = fieldValue.indexOf(key);
      
      if (pattern1.test(value)) {
        return index + key.length == fieldValue.length;
      }
      
      if (pattern2.test(value)) {
        return index === 0;
      }
      
      if (pattern3.test(value)) {
        return index > -1;
      }
      
      throw myna.speak('x001', value);
    default:
      throw myna.speak('x002', operator);
  }
}