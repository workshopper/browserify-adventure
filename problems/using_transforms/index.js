var fs = require('fs');
var path = require('path');
var verify = require('adventure-verify');
var concat = require('concat-stream');

var wakeFile = path.join(__dirname, 'wake.txt');
var expected = fs.readFileSync(__dirname + '/expected.txt', 'utf8');

exports.problem = fs.readFileSync(__dirname + '/problem.txt', 'utf8')
    .replace(/\$WAKE_FILE/g, wakeFile)
;
exports.solution = fs.readFileSync(__dirname + '/solution.txt', 'utf8')
    .replace(/\$WAKE_FILE/g, wakeFile)
;

exports.verify = verify({ modeReset: true }, function (args, t) {
    process.stdin.pipe(concat(function (body) {
        var result = [];
        var con = {
            log: function (msg) { result.push(msg) },
            error: console.error
        };
        Function(['console'],body)(con);
        
        var lines = result.join('\n').trim().split('\n');
        var xlines = expected.trim().split('\n');
        var len = Math.max(lines.length, xlines.length);
        t.plan(len);
        for (var i = 0; i < len; i++) {
            t.equal(lines[i], xlines[i]);
        }
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        Function(body)();
    }));
};
