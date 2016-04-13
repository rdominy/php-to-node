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
		});
	});
	describe('php-to-node module', function() {
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
		});
	});
});