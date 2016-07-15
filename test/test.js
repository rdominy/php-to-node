const assert = require('assert'),
	fs = require('fs');

var ConvertedClass = null;
var testObj = null;
const resultsFilePath = __dirname +  '/translateresults.js';

function cleanup() {
	try {
		fs.unlinkSync(resultsFilePath);
	}
	catch (e) {
		
	}
}

describe('php-to-node', function() {
	before(function() {
		cleanup();
	});
	after(function() {
		cleanup();
	});
	describe('translate.js', function() {
		it('converts a file from php to javascript', function() {
			require('child_process').execSync('node '+ __dirname + '/../translate.js ' + __dirname + '/test_class.php ' +
											'--require ' + __dirname + '/../php-to-node.js ' +
											' > ' + resultsFilePath
										);
		});
		it('loads the converted class successfully', function() {
			ConvertedClass = require(resultsFilePath);
			testObj = new ConvertedClass('foo');
			assert(testObj);
			var a = testObj.getA();
			assert.equal(a,'foo');
			var t = testObj.getTheTime();
			assert(t);
			assert(t>0);
		});
	});
	describe('php-to-node module from converted file', function() {
		it('compatibility functions work as expected', function() {
			assert(testObj);
			assert.equal(3,testObj.getLength('bar'));
			assert.equal(0,testObj.getLength(42));
			assert.equal(0,testObj.getLength(new Date()));
			assert.equal("empty",testObj.hashTest(null, "foo"));
			assert.equal("!isset",testObj.hashTest({foo:"bar"}, "nokey"));
			assert.equal("isset",testObj.hashTest({foo:"bar"}, "foo"));
			var result = ConvertedClass.anyNum(1,6);
			assert(result>=1);
			assert(result<=6);
			assert(testObj.rad(90));
			assert(testObj.getMemUsage()>0);
			assert.equal('exists', testObj.testMany('foo.js,' + __dirname + '/test.js', {findex:1}));
			assert.equal('caught', testObj.exceptional());
			assert.equal(testObj.myHTMLIsSpecial("<p>Some test text</p>"), "&lt;p&gt;Some test text&lt;/p&gt;");
		});
	});
	describe('php-to-node module functions', function() {
		const phpModule = require("php-to-node");
		it('Array sorting', function() {
			// Basic numbers
			var a = [9, 3, 1, 7, 10, 0, 9, 6];
			var b = a.sortAsc();
			
			assert.deepEqual(a, [0, 1, 3, 6, 7, 9, 9, 10]); // Verify in place conversion
			assert.deepEqual(b, [0, 1, 3, 6, 7, 9, 9, 10]);
			b = b.sortDesc();
			assert.deepEqual(b, [10, 9, 9, 7, 6, 3, 1, 0]);
			// Sort the sorted array, should be the same
			b = b.sortDesc();
			assert.deepEqual(b, [10, 9, 9, 7, 6, 3, 1, 0]);
			b.shuffle();
			assert.equal(b.length, 8);
			assert.notDeepEqual(b,[10, 9, 9, 7, 6, 3, 1, 0], "Shuffle same as orignal, unlikely but possible");
			
			// String values
			a = ['oranges', 'apples', 'pears', 'lemons'];
			a = a.sortDesc();
			assert.deepEqual(a, ['pears', 'oranges', 'lemons', 'apples']);
			a = ['oranges', 'apples', 'pears', 'lemons'];
			a.sortAsc();
			assert.deepEqual(a, ['apples', 'lemons', 'oranges', 'pears']);
		});
	});	
});