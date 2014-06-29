#!/usr/bin/env node

var path = require('path');
var workshoppe = require('workshoppe');
var shop = workshoppe('browserify-adventure');

require('../menu.json').forEach(function (name) {
    var d = name.toLowerCase().replace(/\W+/g, '_');
    var dir = path.join(__dirname, '../problems', d);
    shop.add(name, function () {
        return require(dir);
    });
});
shop.execute(process.argv.slice(2));
