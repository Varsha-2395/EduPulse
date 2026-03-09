
exports.word       = word;
exports.words      = words;

exports.sentence   = sentence;
exports.sentences  = sentences;

exports.paragraph  = paragraph;
exports.paragraphs = paragraphs;

var rander = require('rander');
var utils = require('./utils');
var words_list = [
  'alias', 'consequatur', 'aut', 'perferendis', 'sit', 'voluptatem',
  'accusantium', 'doloremque', 'aperiam', 'eaque','ipsa', 'quae', 'ab',
  'illo', 'inventore', 'veritatis', 'et', 'quasi', 'architecto',
  'beatae', 'vitae', 'dicta', 'sunt', 'explicabo', 'aspernatur', 'aut',
  'odit', 'aut', 'fugit', 'sed', 'quia', 'consequuntur', 'magni',
  'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt',
  'neque', 'dolorem', 'ipsum', 'quia', 'dolor', 'sit', 'amet',
  'consectetur', 'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam',
  'eius', 'modi', 'tempora', 'incidunt', 'ut', 'labore', 'et', 'dolore',
  'magnam', 'aliquam', 'quaerat', 'voluptatem', 'ut', 'enim', 'ad',
  'minima', 'veniam', 'quis', 'nostrum', 'exercitationem', 'ullam',
  'corporis', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas',
  'sit', 'suscipit', 'laboriosam', 'nisi', 'ut', 'aliquid', 'ex', 'ea',
  'commodi', 'consequatur', 'quis', 'autem', 'vel', 'eum', 'iure',
  'reprehenderit', 'qui', 'in', 'ea', 'voluptate', 'velit', 'esse',
  'quam', 'nihil', 'molestiae', 'et', 'iusto', 'odio', 'dignissimos',
  'ducimus', 'qui', 'blanditiis', 'praesentium', 'laudantium', 'totam',
  'rem', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos',
  'dolores', 'et', 'quas', 'molestias', 'excepturi', 'sint',
  'occaecati', 'cupiditate', 'non', 'provident', 'sed', 'ut',
  'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error',
  'similique', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt',
  'mollitia', 'animi', 'id', 'est', 'laborum', 'et', 'dolorum', 'fuga',
  'et', 'harum', 'quidem', 'rerum', 'facilis', 'est', 'et', 'expedita',
  'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis',
  'est', 'eligendi', 'optio', 'cumque', 'nihil', 'impedit', 'quo',
  'porro', 'quisquam', 'est', 'qui', 'minus', 'id', 'quod', 'maxime',
  'placeat', 'facere', 'possimus', 'omnis', 'voluptas', 'assumenda',
  'est', 'omnis', 'dolor', 'repellendus', 'temporibus', 'autem',
  'quibusdam', 'et', 'aut', 'consequatur', 'vel', 'illum', 'qui',
  'dolorem', 'eum', 'fugiat', 'quo', 'voluptas', 'nulla', 'pariatur',
  'at', 'vero', 'eos', 'et', 'accusamus', 'officiis', 'debitis', 'aut',
  'rerum', 'necessitatibus', 'saepe', 'eveniet', 'ut', 'et',
  'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
  'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'a',
  'sapiente', 'delectus', 'ut', 'aut', 'reiciendis', 'voluptatibus',
  'maiores', 'doloribus', 'asperiores', 'repellat'
];

/**
 * make first letter of a string uppercase
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:13:05]
 * @param  {string} s 
 * @return {string}
 */
function first_letter_up (s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * randomly return a word from word list
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:14:13]
 * @return {string}
 */
function word () {
  return words_list[rander.dice(words_list.length -1)];
}

/**
 * make a multiple words
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:14:54]
 * @param  {int} n, words count
 * @param  {string or array} glue
 * @return {string}
 */
function words (n, glue) {
  var arr = [];
  var puncs = {
    5   : ["''", '""', '()', '《》', '[]', '<>'],
    100 : ''
  };
  var punc, str;
  n = n || 2;

  do {
    arr.push(word());
  } while ( --n > 0);

  str =  utils.join(arr, glue || ' ');
  punc = utils.pickup_by_probability(puncs);

  if (punc.length == 2) {
    return punc[0] + str + punc[1];
  }

  return str;
}

/**
 * make a sentence
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:15:52]
 * @param  {int} n, included words count
 * @return {string}
 */
function sentence (n) {
  var endPuncs = {
    10: [';', '?', '!', '...'],
    100: '.'
  };

  var glues = {
    10: ["'s", ': ', '-', '~ ', ' —— '],
    100: ', '
  };

  
  var members = [];
  n = n || rander.between(1, 4);

  do {
    members.push(words(rander.between(2, 15)));
  } while (--n > 0);

  // console.log(members);

  return first_letter_up(members.join(utils.pickup_by_probability(glues))) + utils.pickup_by_probability(endPuncs);
}

/**
 * make multiple sentences
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:18:07]
 * @param  {int} n, sentences count
 * @param  {string or array} glue
 * @return {string}
 */
function sentences (n, glue) {
  var arr = [];
  n = n || 2;

  do {
    arr.push(sentence());
  } while (--n > 0);

  return utils.join(arr, glue);
}

/**
 * make a paragraph
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:19:04]
 * @param  {int} n
 * @param  {string or array} glue
 * @return {string}
 */
function paragraph (n, glue) {
  return sentences(n || rander.between(3, 10), glue || ' ');
}

/**
 * make multiple paragraphs
 * 
 * @author bibig@me.com
 * @update [2014-05-18 10:19:45]
 * @param  {int} n
 * @param  {string or array} glue
 * @return {string}
 */
function paragraphs (n, glue) {
  var arr = [];
  n = n || 2;

  do {
    arr.push(paragraph());
  } while ( --n > 0);

  return utils.join(arr, glue);
}