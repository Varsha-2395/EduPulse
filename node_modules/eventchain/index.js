exports.create = create;

var Eventchain = require('./libs/eventchain');

function create (name) {
  return new Eventchain(name);
}

