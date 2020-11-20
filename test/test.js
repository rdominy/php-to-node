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
		const phpModule = require(__dirname + "/../php-to-node.js");
		it('sorts arrays', function() {
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
			assert.notDeepEqual(b,[10, 9, 9, 7, 6, 3, 1, 0], "Shuffle same as orignal, unlikely but possible: "+JSON.stringify(b));

			// String values
			a = ['oranges', 'apples', 'pears', 'lemons'];
			a = a.sortDesc();
			assert.deepEqual(a, ['pears', 'oranges', 'lemons', 'apples']);
			a = ['oranges', 'apples', 'pears', 'lemons'];
			a.sortAsc();
			assert.deepEqual(a, ['apples', 'lemons', 'oranges', 'pears']);
		});
		it('array_column', function() {
			// array of objects
			var testArray = [
				{key: 1234, color: 'red', type: 'apples'},
				{key: 56, color: 'orange', type: 'oranges'},
				{key: 78, color: 'yellow', type: 'lemons'},
				{key: 9, type: 'pears'}
			];
			var a = phpModule.array_column(testArray, 'color');
			assert.deepEqual(a, ['red', 'orange', 'yellow']);
			a = phpModule.array_column(testArray, 'type');
			assert.deepEqual(a, ['apples', 'oranges', 'lemons', 'pears']);
			a = phpModule.array_column(testArray, 'key');
			assert.deepEqual(a, [1234, 56, 78, 9]);
			a = phpModule.array_column(testArray, 'nosuch');
			assert.deepEqual(a, []);

			// empty or null array
			a = phpModule.array_column(null, 'nosuch');
			assert.deepEqual(a, []);
			a = phpModule.array_column([], 'nosuch');
			assert.deepEqual(a, []);
			a = phpModule.array_column({}, 'nosuch');
			assert.deepEqual(a, []);

			// object/hash
			var testObj = {
				item1: {key: 1234, color: 'red', type: 'apples'},
				item2: {key: 56, color: 'orange', type: 'oranges'},
				item3: {key: 78, color: 'yellow', type: 'lemons'},
				item4: {key: 9, type: 'pears'}
			};
			a = phpModule.array_column(testObj, 'color');
			assert.deepEqual(a, ['red', 'orange', 'yellow']);
			a = phpModule.array_column(testObj, 'type');
			assert.deepEqual(a, ['apples', 'oranges', 'lemons', 'pears']);
			a = phpModule.array_column(testObj, 'key');
			assert.deepEqual(a, [1234, 56, 78, 9]);
			a = phpModule.array_column(testObj, 'nosuch');
			assert.deepEqual(a, []);
		});
		it('in_array', function() {
			var testArray = [13, 'red', 'apple'];
			assert(phpModule.in_array(13, testArray));
			assert(phpModule.in_array('red', testArray));
			assert(phpModule.in_array('apple', testArray));
			assert(!phpModule.in_array('nosuch', testArray));
		});
		it('implode', function() {
			assert.equal(phpModule.implode(',', [13, 'red', 'apple']), '13,red,apple');
			assert.equal(phpModule.implode('|', [13, 'red', 'apple']), '13|red|apple');
		})
		it('math.rand', function() {
			for (var i=0;i<100;i++) {
				var result = Math.rand(1,5);
				assert([1,2,3,4,5].indexOf(result) >= 0, "Not in expected range: " + result);
			}
		})
	});
});
