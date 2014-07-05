var shoe = require('shoe');
var sock = shoe('/sock');
var ever = require('ever');

var Widget = require('widget');
var w = Widget();
var elem = document.createElement('div');
document.body.appendChild(elem);
w.appendTo(elem);
var form = elem.querySelector('form');

w.on('message', function (msg) {
    sock.write(JSON.stringify(['msg',msg]) + '\n');
});
var txt = form.querySelector('textarea[name="msg"]')
txt.value = 'howdee pardner';
ever(form).emit('submit');

var style = window.getComputedStyle(txt);
sock.write(JSON.stringify(['bg',style.backgroundColor]) + '\n');
sock.write(JSON.stringify(['fg',style.color]) + '\n');

sock.write(JSON.stringify(['style',true]) + '\n');
