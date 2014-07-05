var fs = require('fs');
var path = require('path');
var verify = require('adventure-verify');
var concat = require('concat-stream');
var http = require('http');
var shoe = require('shoe');
var ecstatic = require('ecstatic')(path.join(__dirname, 'static'));
var split = require('split');
var through = require('through2');
var colorname = require('colornames');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    var expected = [
        [ [ 'msg', 'howdee pardner' ], 'emits the message event' ],
        [ [ 'bg', 'purple' ], 'textarea background set to purple' ],
        [ [ 'fg', 'yellow' ], 'textarea foreground set to yellow' ],
        [ [ 'style', true ], 'using a style tag' ]
    ];
    t.plan(expected.length);
    process.stdin.pipe(concat(function (body) {
        createServer(body, t).pipe(through.obj(function (row, enc, next) {
            var xex = expected.shift();
            var ex = xex[0], desc = xex[1];
            
            if (row[0] === 'fg' || row[0] === 'bg') {
                if (ex[1] !== row[1] && /^#/.test(row[1])) {
                    ex[1] = colorname(ex[1]);
                }
                else if (ex[1] !== row[1] && /^rgb/.test(row[1])) {
                    var rgb = colorname(ex[1]).match(/\w{2}/g);
                    ex[1] = 'rgb(' + rgb.map(function (s) {
                        return parseInt(s, 16);
                    }).join(',') + ')';
                    row[1] = row[1].replace(/\s+/g, '');
                }
            }
            t.deepEqual(row, ex, desc);
            next();
        }));
    }));
});

function createServer (body, t) {
    var output = through.obj();
    var server = http.createServer(function (req, res) {
        if (req.url === '/code.js') {
            res.end(body);
        }
        else ecstatic(req, res)
    });
    server.listen(55500, function () {
        console.log('Web server running. Visit this URL:'
            + ' http://localhost:' + server.address().port
        );
    });
    var sock = shoe(function (stream) {
        stream.pipe(split()).pipe(through.obj(function (buf, enc, next) {
            var line = buf.toString('utf8');
            try { var row = JSON.parse(line) }
            catch (err) {
                if (t) return t.fail(err)
                else console.error(err);
            }
            
            this.push(row);
            next();
        })).pipe(output);
        
        if (t) t.once('end', function () { stream.end() });
    });
    
    if (t) t.once('end', function () {
        server.close();
        setTimeout(function () {
            process.exit();
        }, 100);
    });
    sock.install(server, '/sock');
    return output;
}

exports.run = function (args) {
    process.stdin.pipe(concat(function (body) {
        createServer(body).pipe(through.obj(function (row, enc, next) {
            console.log(row);
            next();
        }));
    }));
};
