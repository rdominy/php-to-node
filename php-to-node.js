"use strict";

const fs = require('fs');

// PHP compatibility functions for porting PHP to JavaScript
// Copyright (c) 2016 Robert Dominy
// Released under the MIT License

module.exports.empty = function(a) {
	return !module.exports.isset(a) || ((a instanceof Array) && a.length==0) || (a==0) || (a=='') || (a==null);
}

module.exports.isset = function(a) {
	return (typeof a != 'undefined');
}

module.exports.defaultarg = function(a, def) {
	return (typeof a != 'undefined') ? a : def;
}

module.exports.mt_rand = function() {
	return (arguments.length==2) ? Math.rand(arguments[0],arguments[1]) : Math.floor(Math.random()*1000000000);
}

module.exports.count = function(obj) {
	var result = 0;
	if (obj instanceof Array) {
		result = obj.length;
	}
	else if (typeof obj == "object") {
		for (var p in obj) result++;
	}
	return result;
}

module.exports.strlen = function(obj) {
	return (obj && obj.length) ? obj.length : 0;
}

module.exports.file_exists = function(filePath) {
	var exists = false;
	try {
		var stats = fs.statSync(filePath);
		exists = true;
	}
	catch(e) {}
	return exists;
}

module.exports.array_key_exists = function(needle, haystack) {
	return haystack[needle] !== undefined;
}

module.exports.explode = function(sep, str) {
	return str.split(sep);
}

module.exports.time = function() {
	return Math.floor((new Date()).getTime()/1000);
}


module.exports.htmlspecialchars = function(text) {
	var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

Math.deg2rad = function(deg) {
	return deg*Math.PI/180.0;
}

Math.rad2deg = function(rad) {
	return rad*180.0/Math.PI;
}

Math.rand = function(min,max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {
			s = "0" + s;
	}
	return s;
}

Array.prototype.sortAsc = function() {
	return this.sort(function (a, b) {return a<b;});
}

Array.prototype.sortDesc = function() {
	return this.sort(function (a, b) {return a>b;});
}

Array.prototype.shuffle = function() {
	return this.sort(function (a, b) {(Math.random()>.5)?true: false;});
}
