<?php

// This is a PHP sample file to be converted to JavaScript.
// It's intentially designed to be usable after conversion, which
// will not be the typical case, purely for purposes of unit testing.

class TestClass {

	private $a = null;
	
	public function __construct($initA) {
		$this->a = $initA;
	}
	
	public function getA()
	{
		return $this->a;
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
}

?>