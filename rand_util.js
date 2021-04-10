'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.Rand_Util=(function(){

	function _dec2hex(dec) {
		return dec.toString(16).padStart(2, "0");
	}

	function random_hex_string(len) {
		var arr = new Uint8Array((len || 32) / 2);
		window.crypto.getRandomValues(arr);
		return Array.from(arr, _dec2hex).join('');
	}

  return {
    random_hex_string
  };
})();
