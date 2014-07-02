var fs = require('fs');
var verify = require('adventure-verify');
var unpack = require('browser-unpack');
var concat = require('concat-stream');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(10);
    process.stdin.pipe(concat(function (body) {
        try { var rows = unpack(body) }
        catch (err) { return t.fail('The input had a syntax error!') }
        if (!rows) return t.fail('The input is not a browserify bundle!');
        
        t.equal(rows.length, 2, '2 files');
        
        var main, uniq;
        if (rows[0].entry) {
            main = rows[0];
            uniq = rows[1];
        }
        else if (rows[1].entry) {
            main = rows[1];
            uniq = rows[0];
        }
        else t.fail('No entry file detected')
        
        t.deepEqual(
            Object.keys(main.deps), ['uniq'],
            'entry file has a single "uniq" dependency'
        );
        
        var con = {
            log: function (msg) {
                t.equal(
                    Object.prototype.toString.call(msg),
                    '[object Array]',
                    'argument to console.log() is an array'
                );
                t.deepEqual(msg.sort(), expected.shift().sort());
            },
            error: console.error
        };
        var prompts = [
            function () { return 'one,two,three,one,four,two' },
            function () { return '7,7,8,8,9,8,10,7' },
            function () { return 'pizza,cats,in,space,in,space,pizza,cats' },
            function () {
                return 'four,square,four,and,several,four,square,years,ago'
            }
        ];
        var expected = [
            [ 'one', 'two', 'three', 'four' ],
            [ '7', '8', '9', '10' ],
            [ 'pizza', 'cats', 'in', 'space' ],
            [ 'four', 'square', 'and', 'several', 'years', 'ago' ]
        ];
        prompts.forEach(function (p) {
            Function(['console','prompt'], body.toString())(con, p);
        });
    }));
});

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        var prompts = [
            function () { return 'one,two,three,one,four,two' },
            function () { return '7,7,8,8,9,8,10,7' },
            function () { return 'pizza,cats,in,space,in,space,pizza,cats' },
            function () {
                return 'four,square,four,and,several,four,square,years,ago'
            }
        ];
        prompts.forEach(function (p) {
            Function(['prompt'], body.toString())(p);
        });
    }));
};
