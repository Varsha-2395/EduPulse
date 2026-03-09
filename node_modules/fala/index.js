module.exports = create;

var yi     = require('yi');
var Fala = require('./libs/fala');

function create (settings) {
  var fala;
  var config = require('./config')(settings);

  return function (req, res, next) {

    if (req.method == 'GET') { return next(); }
   
    fala = Fala.create(config, req.files);
    
    if (fala.validate()) {
      fala.save(function (e) {
        
        if (e) {
          next(e);
        } else {
          req.fala = {data: fala.data};
          next();
        }
      });
    } else { // failed validate
      req.fala = {errors: yi.clone(fala.errors)};
      fala.clear(next);
    } // end of if (fala.validate())
    
  };
}