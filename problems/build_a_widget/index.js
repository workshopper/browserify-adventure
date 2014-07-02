var fs = require('fs');
var path = require('path');
var verify = require('adventure-verify');
var concat = require('concat-stream');
var http = require('http');
var shoe = require('shoe');
var ecstatic = require('ecstatic')(path.join(__dirname, 'static'));
var split = require('split');
var through = require('through2');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(1);
    process.stdin.pipe(concat(function (body) {
        createServer(body, t).pipe(through(function (row, enc, next) {
            t.equal(
                row.toString('utf8'),
                '<div>Hello <span class="name">t-rex</span>!</div>'
            );
            next();
        }));
    }));
});

function createServer (body, t) {
    var output = through();
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
        stream.pipe(split()).pipe(through(function (buf, enc, next) {
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
        createServer(body).pipe(through(function (row, enc, next) {
            console.log(row.toString('utf8'));
            next();
        }));
    }));
};
