var through = require('through2');
var split = require('split');
var combine = require('combine-stream');
var printf = require('printf');

module.exports = function (file) {
    if (!/\.txt/.test(file)) return through();
    var num = 0;
    return combine(split(), through(function (buf, enc, next) {
        var line = buf.toString('utf8');
        if (num % 5 === 0) {
            console.log(printf('%3d %s', num, line));
        }
        else {
            console.log('    ' + line);
        }
        num ++;
    }));
};
