exports.isEmpty       = isEmpty;
exports.isNotEmpty    = isNotEmpty;
exports.areEmpty      = areEmpty;
exports.areNotEmpty   = areNotEmpty;
exports.isPlainObject = isPlainObject;
exports.trim          = trim;
exports.filter        = filter;
exports.merge         = merge;
exports.mergeArray    = mergeArray;
exports.clone         = clone;
exports.cloneArray    = cloneArray;
exports.humanSize     = humanSize;
exports.forEach       = forEach;



function trim (v) {
  
  if ( typeof v == 'string') {
      return v.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  } else {
      return v;
  }

}

function isPlainObject (v) {
  return  typeof v === 'object' && toString.call(v) === '[object Object]';
}

function isEmpty (v) {

  if (v === undefined || v === null || v === '') {
    return true;
  }

  if (Array.isArray(v)) {
    return v.length === 0;  
  }

  if (isPlainObject(v)) {
    return Object.keys(v).length === 0 ;
  }

  return false;
}


function isNotEmpty (v) {
  return ! isEmpty(v);
}

/**
 * [areEmpty description]
 * return true when all arguments are empty
 * 
 * @author bibig@me.com
 * @update [2014-05-09 08:53:45]
 * @return {boolean}
 */
function areEmpty () {
  var i;
  var result = true;

  for (i = 0; i < arguments.length; i++) {
    
    if ( result ) {
      result = isEmpty(arguments[i]);
    } else {
      break;
    }

  }
  return result;

}

/**
 * [areNotEmpty description]
 * return true when all arguments are not empty
 * 
 * @author bibig@me.com
 * @update [2014-05-09 08:56:47]
 * @return {boolean}
 */
function areNotEmpty () {
  var i;
  var result = true;

  for (i = 0; i < arguments.length; i++) {
    
    if ( result ) {
      result = isNotEmpty(arguments[i]);
    } else {
      break;
    }

  }
  return result;
}

/**
 * merge keys of the default object info the target object
 * merge never override the exist keys value
 * only manipulate plain object.
 * support deep merge.
 * 
 * @author bibig@me.com
 * @update [2014-05-05 11:50:11]
 * @param  {object} targetObj
 * @param  {object} defaultObj
 * @return {object}
 *
 * @usage:  
 *    a = merge(a, b);
 *    do not use like this: 
 *    merge(a, b) // unless you sure a is an object.
 *    when a is null or undefined, a should not be given values. merge will return a new object.
 * 
 */
function merge (targetObj, defaultObj) {

  if ( ! targetObj || !isPlainObject(targetObj) ) { targetObj = {};}

  if (! defaultObj || !isPlainObject(defaultObj) ) { return targetObj; }
  
  Object.keys(defaultObj).forEach(function (key) {

    if (targetObj[key] === undefined) {
      targetObj[key] = defaultObj[key];
    } else if ( isPlainObject(targetObj[key]) && isPlainObject(defaultObj[key]) && isNotEmpty(defaultObj[key]) ) {
      targetObj[key] = merge(targetObj[key], defaultObj[key]);
    }

  });

  return targetObj;
}

/**
 * filter target object by given keys
 * the difference between `filter` and `clone` is that filter copyed by referecne, but clone duplicated
 * @author bibig@me.com
 * @update [2014-05-05 11:52:26]
 * @param  {object} target
 * @param  {array or string} keys
 * @return {object}
 * @usage:
 *   filter(target, ['k1', 'k2']);
 *   filter(target, 'k1, k2');
 */
function filter (target, keys) {
  var safe = {};
  
  if (typeof keys === 'string') {
    keys = keys.split(',');
  }

  if ( ! areNotEmpty(target, keys) || ! Array.isArray(keys) ) {
    return safe;
  }

  keys.forEach(function (key) {
    key = trim(key);

    if (isNotEmpty(target[key])) {
      safe[key] = target[key];
    }

  });
  
  return safe;
}

function cloneArray (target) {
  var copycat = [];

  target.forEach(function (ele) {

    if (Array.isArray(ele)) {
      copycat.push(cloneArray(ele));
    } else if (typeof ele == 'object') {
      copycat.push(clone(ele));
    } else {
      copycat.push(ele);
    }

  });

  return copycat;
}

/**
 * clone target object.
 * ...
 * @author bibig@me.com
 * @update [2014-05-05 11:50:05]
 * @param  {object} target
 * @param  {array or string} keys
 * @return {object}
 * @usage: 
 *  clone(target, ['k1', 'k2']);
 *  clone(target, 'k1, k2');
 */
function clone (target, keys) {
  var copycat;
  
  if (isEmpty(target)) {
    return target;
  }

  if (Array.isArray(target)) {
    return cloneArray(target);
  } 
    
  if (isPlainObject(target)) {
    copycat = {};

    if ( typeof keys === 'string') {
      keys = keys.split(',');
    }

    if ( ! keys && ! Array.isArray(keys) ) {
      keys = Object.keys(target);  
    }

    if ( keys.length > 0 ) {
      keys.forEach(function (key) {
        key = trim(key);
        copycat[key] = clone(target[key]);
      });
    }

    return copycat;
  }

  return target;
}

function mergeArray (a, b) {
  var c = [].concat(a);
  
  b.forEach(function (key) {
    
    if (c.indexOf(key) == -1) {
      c.push(key);
    }

  });
  
  return c;
}

function humanSize (size) {
  
  if (size < 1048576) { // 1m
    return parseInt(size * 10 / 1024) / 10  + 'k';
  } else {
    return parseInt(size * 10 / 1048576 ) / 10  + 'm';
  }

}

/**
 * [forEach description]
 * only use for plain object, loop in each key
 * 
 * @author bibig@me.com
 * @update [2014-05-11 10:15:29]
 * @param  {object}   obj       [target object]
 * @param  {Function} fn        [callback]
 * @param  {array or fn}   whiteList 
 * 
 */
function forEach (obj, fn, whiteList) {
  var filterFn;

  if ( ! isPlainObject(obj) ||  isEmpty(obj)) { return; }


  if ( isEmpty(whiteList) ) {
    whiteList = Object.keys(obj);
  } else if ( isPlainObject(whiteList) ) {
    whiteList = Object.keys(whiteList);
  } else if (typeof whiteList == 'function') {
    filterFn = whiteList;
    whiteList = Object.keys(obj);
  } else if ( ! Array.isArray(whiteList) ) {
    whiteList = Object.keys(obj);
  }

  whiteList.forEach(function (k) {
    var v = obj[k];

    if (filterFn) {
      if ( ! filterFn(k, v) ) return;
    }
    
    fn(k, v);
  });
}