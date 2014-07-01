var fs = require('fs');
var verify = require('adventure-verify');

exports.problem = fs.createReadStream(__dirname + '/problem.txt');
exports.solution = fs.createReadStream(__dirname + '/solution.txt');

exports.verify = verify({ modeReset: true }, function (args, t) {
    t.plan(1);
    t.equal(args[0], '555');
});
