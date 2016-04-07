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
		return strlen($str);
	}

	public function hashTest($hash, $key) {
		if (empty($hash)) {
			return "empty";
		}
		if (!isset($hash[$key])) {
			return "!isset";
		}
		else {
			return "isset";
		}	
	}

	protected function rad($deg)
	{
		return deg2rad($deg);
	}
	
	static protected function anyNum($min, $max) {
		return mt_rand($min, $max);
	}
}

?>