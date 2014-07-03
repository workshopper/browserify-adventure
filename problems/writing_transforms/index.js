var fs = require('fs');
var path = require('path');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');

var wakeFile = path.join(__dirname, 'wake.txt');
var problemFile = path.join(__dirname, 'problem.txt');
var solutionFile = path.join(__dirname, 'solution.txt');
var expectedFile = path.join(__dirname, 'expected.txt');

var expected = fs.readFileSync(expectedFile, 'utf8');

exports.problem = fs.readFileSync(problemFile, 'utf8')
    .replace(/\$WAKE_FILE/g, wakeFile)
;
exports.solution = fs.readFileSync(solutionFile, 'utf8')
    .replace(/\$WAKE_FILE/g, wakeFile)
;

exports.verify = verify({ modeReset: true }, function (args, t) {
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        var main;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].entry) {
                main = rows[i];
                break;
            }
        }
        t.ok(main, 'entry point');
        
        var keys = Object.keys(main.deps);
        var txt;
        for (var i = 0; i < keys.length; i++) {
            if (/[\/\\]wake.txt$/.test(keys[i])) {
                txt = keys[i];
                break;
            }
        }
        t.ok(txt, 'required the txt file');
        
        var results = [];
        Function(['console'], body.toString())({
            log: function (msg) { results.push(msg + '\n') },
            error: console.error
        });
        
        var lines = results.join('\n').trim().split('\n');
        var xlines = expected.trim().split('\n');
        var len = Math.max(lines.length, xlines.length);
        t.plan(2 + len);
        
        for (var i = 0; i < len; i++) {
            t.equal(lines[i], xlines[i]);
        }
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        Function(body.toString())();
    }));
};
