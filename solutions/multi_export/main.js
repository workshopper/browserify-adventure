var ndjson = require('./ndjson.js');

console.log(ndjson.parse(prompt()));
console.log(ndjson.stringify(prompt()));
