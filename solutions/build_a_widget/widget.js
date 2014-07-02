var domify = require('domify');
var html = '<div>Hello <span class="name"></span>!</div>';

module.exports = Widget;

function Widget () {
  if (!(this instanceof Widget)) return new Widget;
  this.element = domify(html);
}

Widget.prototype.setName = function (name) {
  this.element.querySelector('.name').textContent = name;
};

Widget.prototype.appendTo = function (target) {
  target.appendChild(this.element);
};
