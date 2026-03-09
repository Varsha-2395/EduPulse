# node-safepass

+ A mini Node.js module to hash password with random string salt.

## Usage

safepass.hash(password, [length])  default length is 8;
safepass.isValid(password, hashstring);

```javascript
var safepass = require("safepass");

// hash password
var hash = safepass.hash(password);
var hash = safepass.hash(password, 10);

// check password
safepass.isValid(password, hash); // return boolean

// or use chain way
safepass.set(hash).isValid(password); // return boolean

```