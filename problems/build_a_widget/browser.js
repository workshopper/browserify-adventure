var shoe = require('shoe');
var sock = shoe('/sock');

var Widget = require('widget');
var w = Widget();
w.setName('t-rex');
var elem = document.createElement('div');
document.body.appendChild(elem);
w.appendTo(elem);

sock.write(JSON.stringify(elem.innerHTML) + '\n');
