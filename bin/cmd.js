#!/usr/bin/env node

var shop = require('workshoppe')();
require('../menu.json').forEach(function (name) {
    var d = name.toLowerCase().replace(/\W+/g, '_');
    var dir = path.join(__dirname, '..', d);
    shop.add(name, require(dir));
});
shop.execute(process.argv.slice(2));
