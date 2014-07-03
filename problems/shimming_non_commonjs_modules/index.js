var fs = require('fs');
var path = require('path');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');
var girls = ' Melanie Brown ("Scary Spice"), Melanie Chisholm ("Sporty Spice"), Emma Bunton ("Baby Spice"), Geri Halliwell ("Ginger Spice"), and Victoria Beckham, née Adams ("Posh Spice")';

var injectWindow = 'var window = {};\n';

var spiceGirlsFile = path.join(__dirname, 'files/spice-girls.js');
var spiceGirlsSrc = fs.readFileSync(spiceGirlsFile, 'utf8');

var mainFile = path.join(__dirname, 'files/main.js');
var mainSrc = fs.readFileSync(mainFile, 'utf8');

exports.problem = fs.readFileSync(__dirname + '/problem.txt', 'utf8')
    .replace(/\$MAIN_FILE/g, mainFile)
    .replace(/\$SPICE_FILE/g, spiceGirlsFile)
;
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

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

