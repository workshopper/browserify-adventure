var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(4);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        t.equal(rows.length, 1, 'a single file in this bundle');
        t.equal(rows[0].entry, true, 'single file should be an entry file');
        t.deepEqual(rows[0].deps, {}, "shouldn't have any deps");
        Function(['console'], body.toString())({
            log: function (msg) { t.equal(msg, 'BEEP BOOP') },
            error: console.error
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        Function(body.toString())();
    }));
};
