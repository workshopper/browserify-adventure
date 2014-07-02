var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');
var falafel = require('falafel');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(10);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        t.equal(rows.length, 3, '3 files in the bundle');
        
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
        t.ok(/^\.\//.test(mainDeps[0]), 'relative require');
        
        t.ok(
            callsPrompt(files.main.source),
            'prompt() should be called in your entry file'
        );
        
        files.uniquely = idMap[files.main.deps[mainDeps]];
        t.deepEqual(
            Object.keys(files.uniquely.deps), [ 'uniq' ],
            'uniquely requires the `uniq` module'
        );
        t.ok(
            !callsPrompt(files.uniquely.source),
            'prompt() should not be called in your uniquely file'
        );
        
        var expected = [
            [ 'one', 'two', 'three', 'four' ],
            [ '7', '8', '9', '10' ],
            [ 'pizza', 'cats', 'in', 'space' ],
            [ 'four', 'square', 'and', 'several', 'years', 'ago' ]
        ];
        run(body, function (res) {
            t.deepEqual(
                res.sort(),
                expected.shift().sort(),
                'expected result'
            );
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        run(body, function (res) { console.log(res) });
    }));
};

function run (body, cb) {
    var prompts = [
        function () { return 'one,two,three,one,four,two' },
        function () { return '7,7,8,8,9,8,10,7' },
        function () { return 'pizza,cats,in,space,in,space,pizza,cats' },
        function () {
            return 'four,square,four,and,several,four,square,years,ago'
        }
    ];
    var con = {
        log: function () { cb.apply(null, [].slice.call(arguments)) },
        error: console.error
    };
    prompts.forEach(function (p) {
        Function(['console','prompt'], body.toString())(con, p);
    });
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
