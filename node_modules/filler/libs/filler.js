module.exports = Filler;

var rander     = require('rander');
var yi         = require('yi');
var helpers    = require('./helpers');
var Eventchain = require('eventchain');
var Upload     = require('./upload');
var async      = require('async');
var myna       = require('myna')({
  100: 'the field <%s> need values definition',
  101: 'no record found in the reference table <%s>'
});


function Filler (can, config) {
  this.can              = can;
  this.config           = config;
  this.images           = config.images;
  this.quantity         = config.quantity;
  this.tables           = config.tables || {};
  this.reference_caches = {};
  this.lang             = config.lang || 'cn';

}

Filler.prototype.run = function (callback) {
  var self = this;
  var exec = function () {
    async.eachSeries(Object.keys(self.quantity), self.fill.bind(self), callback);  
  };

  if (this.config.reset === true) {
    this.can.clear(exec);
  } else {
    exec();
  }

};

Filler.prototype.fill = function (name, callback) {
  var count = this.quantity[name];
  var self = this;
  var tasks = [];

  do {
    tasks.push(name);
  } while (--count > 0);

  async.eachSeries(tasks, this.fillOne.bind(this), callback);
};

Filler.prototype.fillOne = function (name, callback) {
  var self     = this;
  var Table    = this.can.open(name);
  var ec       = Eventchain.create();
  var settings = this.tables[name] || {};

  function getImageFields () {
    var fields = {};

    Table.schemas.forEachField(function (name, field) {

      if (field.isImage) {
        fields[name] = field;  
      }
      
    });

    return fields;
  }

  ec.add(function (name, next) {
    next(null, self.assemble(name));
  });

  ec.add(function (data, next) {
    var fields = getImageFields();
    var upload;

    if (yi.isEmpty(fields)) {
      return next(null, data);
    }

    upload = Upload(fields, settings, self.images);
    upload.run(function (e) {
      if (e) {
        return next(e);
      }

      if (yi.isNotEmpty(upload.req.fala.errors)) {
        console.warn(upload.req.fala);
        return next(new Error('upload images failed'));
      }

      yi.merge(data, upload.req.fala.data);
      next(e, data);
    });
  });

  ec.add(function (data, next) {
    Table.insert(data, next);
  });

  ec.emit(name, callback);

};

Filler.prototype.getReferenceTableIds = function (tableName, fieldName) {
  var Table = this.can.open(tableName);
  var cacheId = this.getReferenceTableCacheId(tableName, fieldName);
  var refTable, filters = {}, records, field;

  if ( ! this.reference_caches[cacheId] ) {
    
    refTable = Table.Ref.getReferenceTable(fieldName);
    field = Table.schemas.getField(fieldName);

    if (field.prepare) {
      filters =  field.prepare.filters || {};
    }

    records = this.can.open(refTable).query(filters).select('_id').execSync();
    
    if (yi.isEmpty(records)) {
      throw myna.speak(101, refTable);
    }

    this.reference_caches[cacheId] = records;
  }

  return this.reference_caches[cacheId];
};

Filler.prototype.getReferenceTableCacheId = function (tableName, refFieldName) {
  return tableName + refFieldName;
};

Filler.prototype.checkFieldValues = function (field) {

  if ( yi.isEmpty(field.values)) {
    throw myna.speak(100, name);
  }

};

Filler.prototype.assemble = function (tableName) {
  var Table    = this.can.open(tableName);
  var self     = this;
  var data     = {};
  var settings = this.tables[tableName] || {};

  Table.schemas.forEachField(function (name, field) {
    var lang, values;

    if (field.isImage) { return; }

    values = settings[name];
    if (yi.isNotEmpty(values)) {
      if (Array.isArray(values)) {
        data[name] = rander.element(values);
      } else {
        data[name] = values;
      }
      return;
    }

    if ( ! field.required || field.default !== undefined || field.type === 'random' || ['created', 'modified'].indexOf(name) > -1 ) { return; }
    

    lang = field.lang || self.lang; 

    switch (field.type) {
      case 'int':
        data[name] = helpers.integer(field);
        break;

      case 'float':
        data[name] = helpers.float(field);
        break;

      case 'array': 
        self.checkFieldValues(field);
        data[name] = rander.dice(field.values.length - 1);
        break;

      case 'enum':
        self.checkFieldValues(field);
        data[name] = rander.element(field.values);
        break;

      case 'map':
      case 'hash':
        self.checkFieldValues(field);
        data[name] = rander.key(field.values);
        break;

      case 'ref':
        data[name] = rander.element(self.getReferenceTableIds(tableName, name))._id;
        break;

      case 'boolean':
        data[name] = rander.element([true, false]);
        break;

      case 'enum':
        self.checkFieldValues(field);
        data[name] = rander.dice(field.values.length - 1);
        break;

      case 'email':
        data[name] = helpers.email();
        break;

      case 'password':
        data[name] = '111111';
        break;

      case 'date':
        data[name] = helpers.date();
        break;

      case 'datetime':
        data[name] = helpers.datetime();
        break;

      case 'timestamp':
        data[name] = helpers.timestamp();
        break;

      case 'alphanumeric':
        data[name] = helpers.alphanumeric(field);
        break;

      case 'numeric':
        data[name] = helpers.numeric(field);
        break;

      // to do
      case 'url':
      case 'uuid':
      case 'alpha':
      case 'ip': // same as ip4
      case 'ip4':
      case 'ip6':
      case 'creditCard':
      case 'credit card': // same as creditCard
        data[name] = null; 
        break;

      case 'text':
        data[name] = helpers.text(field, lang);
        break;

      default:
        data[name] = helpers.string(field, lang);
        
    }
  });

  return data;
};
