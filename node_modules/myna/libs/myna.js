exports = module.exports = create;

var util = require('util');




function create (messages) {
  return new Myna(messages);
}

/**
 * Myna construction
 * 
 * @author bibig@me.com
 * @update [2014-05-21 15:19:51]
 * @param  {object} messages 
 *         eg: { '1001': 'no data found', '1003': 'invalid param: %s'}
 *     
 */
function Myna (messages) {
  this.messages = messages;
}


Myna.prototype.checkCode = function (code) {
  
  if ( code === undefined || code === null || code === '') {
    throw new Error('Missing error code !');
  }
  
  if ( ! this.messages[code + ''] ) {
    throw new Error('Undefined error code: [' + code + ']');
  }
};

Myna.prototype.getMessage = Myna.prototype.message = function (code/*,var1, var2*/) {
  var args = [];

  this.checkCode(code);
  args.push(this.messages[code + '']);
  
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  
  return util.format.apply(util, args);
};


Myna.prototype.speak = function (code/*,var1, var2*/) {
  var message = this.message.apply(this, arguments);
  var error = new Error(message);

  error.code = code;

  return error;
};