'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.Data_Util=(function(){

  function base64_url_encode(str) { // takes base64 encoded string as input
    return str
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  function base64_url_decode(input) { // returns base64 encoded sting
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    }

    return input;
  }

  // https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
	function get_binary_string(byte_array){
		const CHUNK = 0x8000;
		var chunks = [];
		for (var i=0; i < byte_array.length; i+=CHUNK) {
			var chunk = String.fromCharCode.apply(null, byte_array.subarray(i, i+CHUNK));
			chunks.push(chunk);
		}
		return chunks.join("");
	}

  function base64_encode_byte_array(byte_array){
		return btoa(get_binary_string(byte_array));
  }

  function base64_url_encode_byte_array(byte_array){
		return base64_url_encode( base64_encode_byte_array(byte_array) );
  }

	function base64_decode_to_byte_array(str) {
		return Uint8Array.from(atob(str), c => c.charCodeAt(0))
	}

  return {
    base64_url_encode,
    base64_url_decode,
    base64_encode_byte_array,
    base64_url_encode_byte_array,
    base64_decode_to_byte_array
  };
})();
