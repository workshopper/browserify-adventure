var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(3);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        var expected = [
            'http://substack.net/filez/hi/doge.gif',
            'http://lebron.technology/lebron.jpeg',
            'https://fbi.gov/classified/x-files/swamp_monster.pdf'
        ];
        run(body, function (res) {
            t.equal(res.output[0], expected.shift(), res.input);
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        run(body, function (res) {
            console.log('INPUT: ' + JSON.stringify(res.input));
            console.log('OUTPUT: ' + JSON.stringify(res.output));
            console.log();
        });
    }));
};

function run (body, cb) {
    var inputs = [
        'http://substack.net/filez/dogez/img.cgi?file=../hi/doge.gif',
        'http://lebron.technology/nba/allstars?slamdunk=true&file=/lebron.jpeg',
        'https://fbi.gov/classified/docs.php?file=x-files/swamp_monster.pdf&xtag=333',
    ];
    var last = null;
    var con = {
        log: function () {
            cb({ input: last, output: [].slice.call(arguments) })
        },
        error: console.error
    };
    var prompt = function () {
        last = inputs.shift()
        return last;
    };
    var size = inputs.length;
    for (var i = 0; i < size; i++) {
        Function(['console','prompt'], body.toString())(con, prompt);
    }
}
