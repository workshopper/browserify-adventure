var uniq = require('uniq');

module.exports = function (str) {
  return uniq(str.split(','));
};
