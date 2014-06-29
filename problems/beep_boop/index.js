var fs = require('fs');
var tape = require('tape');

exports.show = function () {
    return fs.createReadStream(__dirname + '/problem.txt');
};

exports.verify = require('../../lib/verify.js')(function (args, t) {
    t.plan(2);
    t.ok(true, 'beep boop...');
    t.equal(1+1, 2);
});
