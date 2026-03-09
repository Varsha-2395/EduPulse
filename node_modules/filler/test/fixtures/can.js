module.exports = create;

var Jsoncan = require('jsoncan');
var path = require('path');

var seqs = function (num) {
  var list = [];
  num = num || 20;
  for (var i = 1; i <= num; i++) { list.push('#' + i); }
  return list;
};

var tables = {
  site: {
    adminUser: {
      type: 'alphanumeric',
      min: 3,
      max: 10,
      required: true,
      isInput: true
    },  
    adminPassword: {
      type: 'password',
      max: 50,
      required: true,
      isInput: true
    },
    adminRole: {
      type: 'enum',
      required: true,
      values: ['root', 'adminitrator', 'user', 'editor']
    },
    modified: { 
      type: 'modified'
    }
  },

  articleCategories: {
    seq: { 
      type: 'array',
      required: true,
      values: seqs(),
      isInput: true,
      inputType: 'select'
    },
    name: {
      type: 'string',
      required: true,
      isInput: true,
      max: 50
    },
    articlesCount: {
      type: 'int',
      default: 0,
      required: true
    }
  },
  
  articles: {
    id: {
      type: 'random',
      text: 'id',
      required: true,
      unique: true,
      size: 10
    },
    _articleCategory: {
      type: 'ref',
      required: true,
      isInput: true,
      inputType: 'select',
      present: 'name',
      counter: 'articlesCount'
    },
    title: {
      type: 'string',
      required: true,
      max: 100,
      isInput: true
    },
    summary: {
      type: 'string',
      required: true,
      max: 1000,
      isInput: true,
      inputType: 'textarea',
      rows: 4
    },
    content: {
      type: 'text',
      required: true,
      isInput: true,
      inputType: 'rich_textarea'
    },
    isPublic: { 
      type: 'boolean',
      default: false, 
      isInput: true, 
      inputType: 'checkbox'
    },
    hasImages: {
      type: 'boolean',
      default: true,
      isInput: true, 
      inputType: 'checkbox'
    },
    imagesCount: {
      type: 'int',
      default: 0
    },
    created :{
      type: 'created'
    },
    modified: {
      type: 'modified'
    }
  },

  articleImages: {
    id: {
      type: 'random',
      unique: true,
      index: true
    },
    _article: {
      type: 'ref',
      required: true, 
      isInput: true, 
      inputType: 'select', 
      present: 'title',
      // ref: 'articles',
      counter: 'imagesCount',
      prepare: {
        select: ['title'],
        filters: { hasImages: true, isPublic: false },
        order: ['created', true]
      }
    },
    seq: {
      type: 'array',
      values: seqs(),
      isInput: true,
      inputType: 'select'
    },
    title: {
      type: 'string',
      required: true,
      max: 50,
      isInput: true
    },
    memo: {
      type: 'string',
      max: 1000,
      isInput: true,
      inputType: 'rich_textarea',
      rows: 3
    },
    image: {
      type: 'string',
      text: '图片', 
      max: 100,
      required: true,
      isInput: true,
      inputType: 'file',
      inputHelp: 'Please upload images under 4m',
      isImage: true,
      path: path.join(__dirname, './uploads'),
      url: '/uploads/',
      maxFileSize: 1200000,
      exts: ['jpg', 'jpeg', 'gif', 'png'],
      sizeField: 'size',
      // cropImage: 'Center',
      // isFixedSize: true,
      imageSize: [600, 400],
      thumbs: ['100x100', '50x50'],
      // thumbSize: [100],
      hasThumb: true,
      thumbPath: false // use default
    },
    size: {
      type: 'int',
      default: 0
    },
    created:  { 
      type: 'created'
    },
    modified: { 
      type: 'modified'
    }
  }

};

function create (path) {
  return new Jsoncan(path, tables);
}