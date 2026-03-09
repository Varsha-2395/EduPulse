var Eventchain = require('../index');
var ec = Eventchain.create('basic event');

ec.add(function (string, next) {
  var id = 1;
  setTimeout(function () {
    console.log('%s on #%d', string, id);
    next();
  }, 1000);
});

ec.add(function (string, next) {
  var id = 2;
  setTimeout(function () {
    console.log('%s on #%d', string, id);
    next();
  }, 1000);
});


/*
ec.add(function (string, next) {
  var id = 2.5;
  setTimeout(function () {
    next(new Error('im tired!'));
  }, 1000);
});
*/

ec.add(function (string, next) {
  var id = 3;
  setTimeout(function () {
    console.log('%s on #%d', string, id);
    next();
  }, 1000);
});

ec.add(function (string, next) {
  var id = 4;
  setTimeout(function () {
    console.log('%s on #%d', string, id);
    next();
  }, 1000);
});



ec.emit('hello world', function (e) {
  if (e) { 
    console.error(e);
    return;
  }
  
  console.log('over, and a new round will begin!');
  ec.emit('hello eventchain', function (e) {
    if (e) { 
      console.error(e); 
    } else {
      console.log('new round over!');

      ec.clear(); // if clear(),  all events in chain will be removed, and the eventchain cannot fire again.
      
      ec.emit('will not run');
    }
  });
});