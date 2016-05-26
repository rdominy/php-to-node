<?php

// This is a PHP sample file to be converted to JavaScript.
// It's intentially designed to be usable after conversion, which
// will not be the typical case, purely for purposes of unit testing.

class TestClass {

	private $a_member = null;
	
	public function __construct($initA) {
		$this->a_member = $initA;
	}
	
	public function getA()
	{
		return $this->a_member;
	}
	
	public function getLength($str) {
		$result = strlen($str);  // test local variable declarations
		return $result;
	}

	public function hashTest($hash, $key) {
		$result = null;
		if (empty($hash)) {
			$result = "empty";
		}
		else if (!isset($hash[$key])) {
			$result = "!isset";
		}
		else {
			$result = "isset";
		}
		return $result;
	}

	protected function rad($deg)
	{
		return deg2rad($deg);
	}
	
	static protected function anyNum($min, $max) {
		return mt_rand($min, $max);
	}
	
	public function getMemUsage() {
		return memory_get_usage();
	}
	
	public function testMany($filesString, $hash) {
		$result = '';
		$files = explode(',', $filesString);
		
		if (array_key_exists('findex', $hash)) {
			if (file_exists($files[$hash['findex']])) {
				$result = 'exists';
			}
		}
		return $result;
	}
	public function exceptional() {
		$result = '';
		try {
			throw new Exception("exception");
		}
		catch (Exception $e) {
			$result = "caught";
		}
		return $result;
	}
	
	public function getTheTime() {
		return time();
	}
	
	public function myHTMLIsSpecial($html) {
		return htmlspecialchars($html);
	}
}

?>