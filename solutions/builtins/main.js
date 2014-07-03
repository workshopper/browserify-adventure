var url = require('url');
var querystring = require('querystring');

var addr = prompt();
var query = url.parse(addr).query;
var params = querystring.parse(query);
console.log(url.resolve(addr, params.file));
