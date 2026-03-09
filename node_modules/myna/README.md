# Myna
+ an easy error messages generator.

### install
npm install myna

### usage

```javascript

  var myna = require('myna')({
    1001: 'invalid params',
    1002: 'unknown key: %s',
    1003: 'invalid id %s found in %s'
  });

  // create error
  var err = myna.speak(1001);  

  // throw error with arguments
  throw myna.speak(1002, 'id');
  throw myna.speak('1003', 'foo', 'bar');

```