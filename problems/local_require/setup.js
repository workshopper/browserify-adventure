var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
if (!fs.existsSync(__dirname + '/work')) {
    fs.mkdirSync(__dirname + '/work');
}

module.exports = function () {
    var n = Math.floor(Math.random() * 1000) + 1;
    var src = 'module.exports = function (n) { return n * ' + n + '}';
    fs.writeFileSync(__dirname + '/work/foo.js', src);
    
    return {
        args: [ Math.floor(Math.random() * 1000) + 1 ],
        solution: run,
        submission: run
    }
    
    function run (cmd) {
        var file = path.resolve(process.cwd(), cmd[0]);
        var src = fs.readFileSync(file);
        fs.writeFileSync(__dirname + '/work/x.js', src);
        cmd[0] = __dirname + '/work/x.js';
        
        var opts = { cwd: __dirname + '/work' };
        return spawn(process.execPath, cmd, opts);
    }
};
