#!/usr/bin/env node
// Simple PHP to Javascript Translator
// Copyright (c) 2016 Robert Dominy
// Released under the MIT License

const fs = require('fs'),
	readline = require('readline'),
	Args = require('pixl-args');

var args = new Args({require: "php-to-node"});

if (process.argv.length < 3) {
	console.log(process.argv);
	console.log("Usage: node php-to-node.js php_file.php");
	process.exit(0);
}




var transforms = [
	// PHP header
	{	search: new RegExp(/^\<\?php/),
		replace: ''
	},
	// PHP footer
	{	search: new RegExp(/^\?\>/),
		replace: ''
	},	
	// Constructor
	{	search: new RegExp(/(public|protected|private)*\s+function\s+__construct/),
		replace: 'constructor'
	},
	// Data members
	{	search: new RegExp(/(public|protected|private)\s+\$/g), 
		replace: ''
	},
	// Variables -- remove $
	{	search: new RegExp(/\$(\w+)/g),
		replace: '$1'
	},
	// Object reference
	{	search: new RegExp(/\-\>/g),
		replace: '.'
	},
	// Method definition
	{	search: new RegExp(/(public|protected|private)\s+function\s+/),
		replace: ''
	},
	// Static class reference
	{	search: new RegExp(/\:\:/g),
		replace: '.'
	},
	// String concatentation but only if spaces around period
	{	search: new RegExp(/\s+\.\s+/g),
		replace: ' + '
	},
	// Change new Exception to Error
	{	search: new RegExp(/new\s+Exception\s*\(/g),
		replace: 'new Error('
	},
	// Remove type from catch
	{
		search: new RegExp(/catch\s*\(\s*\w+\s+/),
		replace: 'catch ('
	},
	
	// Builtin functions
	{	search: new RegExp(/floatval/g),
		replace: 'Number.parseFloat'
	},
	{	search: new RegExp(/intval/g),
		replace: 'Number.parseInt'
	},
	{	search: new RegExp(/deg2rad/g),
		replace: 'Math.deg2rad'
	},
	{	search: new RegExp(/rad2deg/g),
		replace: 'Math.rad2deg'
	},
	{	search: new RegExp(/mt_rand/g),
		replace: 'php.mt_rand'
	},
	{	search: new RegExp(/json_decode/g),
		replace: 'JSON.parse'
	},
	{	search: new RegExp(/json_encode/g),
		replace: 'JSON.stringify'
	},
	// Note: escape/unescape are deprecated in favor of encode/decodeURI, but in practice they are not compatible with the PHP equivalents
	{	search: new RegExp(/urlencode/g),
		replace: 'escape'
	},
	{	search: new RegExp(/urldecode/g),
		replace: 'unescape'
	},
	{	search: new RegExp(/file_get_contents\s*\(([^\)]+)\)/g),
		replace: 'fs.readFileSync($1, "utf-8")',
		requires: 'fs'
	},
	{	search: new RegExp(/(\s+|\()count\s*\(/g),
		replace: '$1php.count('
	},
	{	search: new RegExp(/isset\s*\(/g),
		replace: 'php.isset('
	},
	{	search: new RegExp(/(\s+|\()empty\s*\(/g),
		replace: '$1php.empty('
	},
	{	search: new RegExp(/(\s+|\()strlen\s*\(/g),
		replace: '$1php.strlen('
	},
	{	search: new RegExp(/file_exists\s*\(/g),
		replace: 'php.file_exists('
	},
	{	search: new RegExp(/explode\s*\(/g),
		replace: 'php.explode('
	},
	{	search: new RegExp(/array_key_exists\s*\(/g),
		replace: 'php.array_key_exists('
	},
	{	search: new RegExp(/memory_get_usage\s*\([^\)]*\)/g),
		replace: 'process.memoryUsage().rss',
		requires: 'process'
	},
	
	
];

// Parsing States
var classBegin = false;
var inConstructor = false;
var gotConstructorBrace = false;
var functionBegin = false;
var atEnd = false;

// Accumulate data members to add to constructor
var members = [];
var classes = [];
var lines = [];
var requires = [];
var variables = [];

function writeLn(line) {
	lines.push(line);
}

function flushBuffer() {
	console.log('"use strict";');
	console.log('const php = require("' + args.get('require') + '");');
	requires.forEach(function(req) { console.log("const " + req + " = require('" + req + "');") });
	lines.forEach(function(lines) {console.log(lines);});
}

function addRequires(newRequire) {
	if (requires.indexOf(newRequire)==-1) {
		requires.push(newRequire);
	}
}

function checkLine(line) {
	if (/^\s*class/.test(line)) {
		classBegin = true;
		functionBegin = false;
		
		var matches = line.match(/^\s*class\s+(\w+)/);
		if (matches && matches.length>=2) {
			classes.push(matches[1]);
		}
	}
	else if (/^\s*(public|protected|private)\s+function\s+__construct/.test(line)) {
		inConstructor = true;
		classBegin = false;
	}
	else if (/^\s*(public|protected|private)\s+function\s+/.test(line)) {
		classBegin = false;
		inConstructor = false;
	}
	
	// If we're starting a new function or method, reset variable declarations
	if (/^\s*(public\s+|protected\s+|private\s+)*function/.test(line)) {
		functionBegin = true;
		variables = [];
	}

	if (inConstructor) {
		gotConstructorBrace = /\{/.test(line);
	}
	
	if (/^\?\>/.test(line)) {
		atEnd = true;
	}
}

function isDataMember(newLine) {
	return (/^\s*[\w\_]+\s*\=/.test(newLine));
}

function createDataMember(newLine) {
	return newLine.replace(/^(\s*)([\w\_]+)\s*\=(.*)$/,"\t$1this.$2 =$3");
}

function dumpMembers() {
	members.forEach( function(member) {
		writeLn(member);
	});
	members = [];
}

function exportClasses() {
	classes.forEach( function(className) {
		writeLn('module.exports = '+className+';');
	});
	classes = [];
}


const rl = readline.createInterface({
	input: fs.createReadStream(process.argv[2])
});

rl.on('line', function (line) {
	var newLine = line;
	
	checkLine(newLine);
	
	transforms.forEach(function(transform) {
		if (transform.search.test(newLine)) {
			newLine = newLine.replace(transform.search,transform.replace);
			if (transform.requires) {
				addRequires(transform.requires);
			}
		}
		
	});
	
	if (classBegin) {
		if (isDataMember(newLine)) {
			members.push(createDataMember(newLine));
			newLine = null;
		}
	}
	
	if (!classBegin && !inConstructor &&  members.length>0) {
		// Constructor must not be first method so define one now
		writeLn("\tconstructor() {");
		dumpMembers();
		writeLn("\t}\n\n");
	}
	
	if (functionBegin && /^\s*\w+\s*\=/.test(newLine)) {
		var matches = newLine.match(/^(\s*)(\w+)(\s*\=.+)$/);
		var whitespace = (matches.length == 4)  ? matches[1] : '';
		var varName = matches[matches.length-2];
		if (variables.indexOf(varName)==-1) {
			newLine = whitespace + 'var ' + varName + matches[matches.length-1];
			variables.push(varName);
		}
	}
	
	if (newLine!==null) {
		writeLn(newLine);
	}
	
	if (inConstructor && gotConstructorBrace && members.length>0) {
		dumpMembers();
	}
	
	if (atEnd) {
		exportClasses();
		flushBuffer();
	}
});