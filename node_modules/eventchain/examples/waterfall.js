var Eventchain = require('../index');
// if do not declare a name for create. it will create an run-once eventchain.
var ec = Eventchain.create();
var fn = function (id, next) {
  setTimeout(function () {
    console.log('i am No.%d', id);
    next(null, id + 1);
  }, 1000);
};


ec.add(fn);
ec.add(fn);
ec.add(fn);
ec.add(fn);
ec.add(fn);


/*ec.add(function (id, next) {
  setTimeout(function () {
    next(new Error('im tired!'));
  }, 1000);
});
*/
ec.add(fn);

ec.emit(100, function (e) {
  if (e) { 
    console.error(e);
    return;
  } else {
    console.log('all done!');

    // because ec is run-once emit. so cannot fire again.
    ec.emit(200, function (e) {
      if (e) { 
        console.error(e);
        return;
      }
      console.log('all done!');
    });
  }

});