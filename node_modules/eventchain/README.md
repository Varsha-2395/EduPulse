### Eventchain

+ Eventchain is a module to call the callbacks on same event one after one.
+ Just like the series feature in async module, but it's powered by node built-in module "EventEmitter".
+ For better code structure, more maintainable.

### install

npm install eventchain

### Usage

```javascript

  var Eventchain = require('eventchain');


  var ec = Eventchain.create('after save');

  // if do not declare a name, it will create a run-once eventchain with a random name.
  // eg: var ec-only-once = Eventchain.create();
  
  ec.add(function (record, next) {
    ...
    // pass the default arguments to the next event.
    next();
    
    // pass an error to top callback.
    next(new Error('...'));

    // pass the new argument to the next event, replace of the default.
    record.id = 'xxx';
    next(null, record);
  });
  
  ec.add(anotherCallback);
  
  ec.add(anotherCallback);
  
  
  // emit, should be given two arguments.
  // the first is an args which will pass to the first event in the chain.
  // the second is the top callback, which will handle error if event pass back to it, or fire after all the events executed.
  ec.emit(args, function (e) {
    ...
  });

  // if ec is done and no useful any more. remember to clear it.
  // run-once eventchain will clear itself automatically.
  ec.clear();

```

more detail, please see the example files.