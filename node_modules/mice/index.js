module.exports = create;

function create (lang) {
  lang = lang || 'cn';

  return require('./libs/' + lang);
}