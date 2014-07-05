var fs = require('fs');
var domify = require('domify');
var insertCss = require('insert-css');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var html = fs.readFileSync(__dirname + '/widget.html', 'utf8');
var css = fs.readFileSync(__dirname + '/widget.css', 'utf8');
insertCss(css);

module.exports = Widget;
inherits(Widget, EventEmitter);

function Widget () {
  var self = this;
  if (!(this instanceof Widget)) return new Widget;
  var form = this.element = domify(html);
  
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var msg = form.querySelector('textarea[name="msg"]').value;
    self.emit('message', msg);
  });
}

Widget.prototype.appendTo = function (target) {
  target.appendChild(this.element);
};
