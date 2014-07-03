var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');
var falafel = require('falafel');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(11);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        t.ok(rows.length >= 2, '>= 2 files in the bundle');
        
        var files = {};
        var idMap = {};
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].entry) {
                files.main = rows[i];
            }
            idMap[rows[i].id] = rows[i];
        }
        if (!files.main) t.fail('No entry file detected')
        
        var mainDeps = Object.keys(files.main.deps);
        t.equal(mainDeps.length, 1);
        t.ok(/^\.[\/.]/.test(mainDeps[0]), 'relative require');
        
        t.ok(
            callsPrompt(files.main.source),
            'prompt() should be called in your entry file'
        );
        
        files.ndjson = idMap[files.main.deps[mainDeps]];
        t.ok(
            !callsPrompt(files.ndjson.source),
            'prompt() should not be called in your ndjson file'
        );
        
        var expected = [
            [{"beep":"boop"},[3,4,5],{"x":4,"y":5}],
            '{"a":7,"b":8,"c":9}\n[3,9,1,5]\n555',
            [1,2,3],
            '7\n8\n9',
            [{"a":{"b":{"c":{"d":1234}}}},{"z":567}],
            '[5,3,2]\n{"a":{"b":{"c":{"d":1234}}}}'
        ];
        run(body, function (res) {
            t.deepEqual(res, expected.shift(), 'expected result');
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        run(body, null, true);
    }));
};

function run (body, cb, info) {
    var prompts = [
        '{"beep":"boop"}\n[3,4,5]\n{"x":4,"y":5}',
        [ {a:7,b:8,c:9}, [3,9,1,5], 555 ],
        
        '1\n2\n3',
        [ 7, 8, 9 ],
        
        '{"a":{"b":{"c":{"d":1234}}}}\n{"z":567}',
        [[5,3,2],{"a":{"b":{"c":{"d":1234}}}}]
    ];
    var prompt = function () {
        var p = prompts.shift()
        if (info) console.error('INPUT: ' + JSON.stringify(p));
        return p;
    };
    var con = {
        log: function (msg) {
            if (info) {
                console.error('OUTPUT: ' + JSON.stringify(msg) + '\n');
            }
            if (cb) cb.apply(null, [].slice.call(arguments))
        },
        error: console.error
    };
    for (var i = 0; i < 6; i += 2) {
        Function(['console','prompt'], body.toString())(con, prompt);
    }
}

function callsPrompt (body) {
    var called = false;
    falafel(body, function (node) {
        if (node.type === 'CallExpression'
        && node.callee.type === 'Identifier'
        && node.callee.name === 'prompt') {
            called = true;
        }
    });
    return called;
}
