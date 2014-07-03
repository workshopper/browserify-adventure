var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');
var girls = ' Melanie Brown ("Scary Spice"), Melanie Chisholm ("Sporty Spice"), Emma Bunton ("Baby Spice"), Geri Halliwell ("Ginger Spice"), and Victoria Beckham, née Adams ("Posh Spice")';

var injectWindow = 'var window = {};\n';

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

var spiceGirlsSrc = fs.readFileSync(__dirname + '/lib/spice-girls.js', 'utf8');
var mainSrc = fs.readFileSync(__dirname + '/main.js', 'utf8');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(3);
    process.stdin.pipe(concat(function (body) {

        t.equal(spiceGirlsSrc.length, 213, 'You should not edit the spice-girls.js file')
        t.equal(mainSrc.length, 81, 'You should not edit the main.js file')


        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle or an error occurred (see above)!');

        Function(['console'], injectWindow + body.toString())({
            log: function (msg) { t.equal(msg, girls) },
            error: console.error
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        Function(injectWindow + body.toString())();
    }));
};

