# xun
+ xun provides basic query functions for records-like array, like underscore.collection
+ btw, xun is a chinese word '寻' means query.

### install
npm install xun

### usage

```javascript

  var Xun = require('xun');
  var xun = Xun.create(records);

  // the following examples will return an array.

  xun.order('created').skip(20).limit(20).select('id', 'name');
  
  xun.where('name', '张三').select();
  
  xun.where('age', '>', 10).select(['id', 'name', 'age']);

  xun.where('height', '<=', 6).where('age', '>', 15).order('name').select('id, name');

```