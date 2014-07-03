var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(1);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        var expected = [
            'http://substack.net/filez/hi/doge.gif'
        ];
        run(body, function (res) {
            t.equal(res, expected.shift(), 'expected result');
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        run(body, function (res) { console.log(res) });
    }));
};

function run (body, cb) {
    var inputs = [
        'http://substack.net/filez/dogez/img.cgi?file=../hi/doge.gif',
    ];
    var con = {
        log: function () { cb.apply(null, [].slice.call(arguments)) },
        error: console.error
    };
    var prompt = function () { return inputs.shift() };
    var size = inputs.length;
    for (var i = 0; i < size; i++) {
        Function(['console','prompt'], body.toString())(con, prompt);
    }
}
