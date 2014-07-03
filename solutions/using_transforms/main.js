var fs = require('fs');
var txt = fs.readFileSync(__dirname + '/../../problems/using_transforms/wake.txt', 'utf8');

var lines = txt.split('\n');
lines.forEach(function (line, index) {
    if (index % 5 === 0) {
        console.log(pad(String(index), 3) + ' ' + line);
    }
    else {
        console.log('    ' + line);
    }
});

function pad (s, n) {
    return Array(Math.max(0,n-s.length+1)).join(' ') + s;
}
