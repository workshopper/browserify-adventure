exports.parse = function (str) {
  return str.split('\n').map(JSON.parse);
};

exports.stringify = function (rows) {
  return rows.map(JSON.stringify).join('\n');
};
