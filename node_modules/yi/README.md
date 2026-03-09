# Yi
+ this module collect common useful functions
+ btw, yi is a chinese word '易', which means easy.

### install
 npm install yi

### members

+ isEmpty
+ clone
+ merge
+ filter

### usage

``` javascript
  var yi = require('yi');

  yi.isEmpty(undefined); // true
  yi.isEmpty(null); // true
  yi.isEmpty(''); // true
  yi.isEmpty([]); // true
  yi.isEmpty({}); // true

  yi.jsEmpty(new Date()); // false
  yi.isEmpty(Math); // false
  yi.isEmpty(/hello/); // false

```

please see the test files