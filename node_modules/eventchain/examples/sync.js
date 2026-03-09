var Eventchain = require('../index');
var ec = Eventchain.create('sync event');

ec.add(function (string) {
  var id = 1;
  console.log('%s on #%d', string, id);
});

ec.add(function (string) {
  var id = 2;
  console.log('%s on #%d', string, id);
});

ec.emit('im a sync way');




