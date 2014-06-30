var tape = require('tape');
var parser = require('tap-parser');
var faucet = require('faucet');

module.exports = function (fn) {
    return function (args, cb) {
        var test = tape.createHarness();
        test(function (t) { fn(args, t) });
        var stream = test.createStream();
        stream.pipe(parser(function (results) { cb(results.ok) }));
        return stream.pipe(faucet());
    };
};
