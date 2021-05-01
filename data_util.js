'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.Data_Util=(function(){

  function base64url_encode(str) { // takes base64 encoded string as input
    return str
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  function base64url_decode(input) { // returns base64 encoded sting
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

  function base64url_encode_byte_array(byte_array){
		return base64url_encode( base64_encode_byte_array(byte_array) );
  }

	function base64_decode_to_byte_array(str) {
		return Uint8Array.from(atob(str), c => c.charCodeAt(0))
	}

	function base64url_decode_to_byte_array(str) {
		return base64_decode_to_byte_array( base64url_decode(str) );
	}

  const _BASE64_PACK_PREFIX="data:;base64,";
  
  function encode_byte_arrays_in_dict(dict){
    var copy = {};
    for (var key in dict){
      var value = dict[key];
      if (value instanceof Uint8Array){
        value = _BASE64_PACK_PREFIX + base64_encode_byte_array(value)
      }
      copy[key] = value;
    }
    return copy;
  }

  function decode_byte_arrays_in_dict(dict){
    var copy = {};
    for (var key in dict){
      var value = dict[key];
      if (typeof(value) === 'string' || value instanceof String){
        if (value.startsWith(_BASE64_PACK_PREFIX) ){
          value = value.substr(_BASE64_PACK_PREFIX.length);
          value = base64_decode_to_byte_array( value );
        }
      }
      copy[key] = value;
    }
    return copy;
  }

  function string_to_byte_array(str, encoding) {
    if (!encoding){
      encoding = 'utf-8';
    }
    return new TextEncoder(encoding).encode(str);
  }

  function byte_array_to_string(byte_array, encoding = "utf-8") {
    return new TextDecoder(encoding).decode(byte_array);
  }

  function byte_array_to_hex( byte_array ){
		var hex = [];
    for (var i=0; i<byte_array.length; i++){
      hex.push(_pad_hex( byte_array[i].toString(16) ));
    }
    return hex.join('');
  }

  function hex_to_byte_array( hex ){
    hex = _pad_hex(hex);
    var byte_array = new Uint8Array(hex.length/2);

    for (var i=0, j=0; i < byte_array.length; i++, j+=2){
      byte_array[i] = parseInt(hex.slice(j, j+2), 16);
    }
    return byte_array;
  }

  function _pad_hex(hex){
    if (hex.length % 2 == 1) {
      hex = '0' + hex;
    }
    return hex;
  }

  // see https://coolaj86.com/articles/convert-js-bigints-to-typedarrays/
  function bigint_to_byte_array(number){
    return hex_to_byte_array(number.toString(16));
  }

  function byte_array_to_bigint(byte_array){
    return BigInt('0x' + byte_array_to_hex( byte_array ));
  }

  // Base58 encoding, derived from https://github.com/paulmillr/micro-base58/blob/master/index.js

  const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  function base58_encode_byte_array(byte_array, alphabet = B58_ALPHABET){
    let x = byte_array_to_bigint(byte_array);
    let list = [];
    while (x > 0) {
      var mod = Number(x % 58n);
      x = x / 58n;
      list.push(alphabet[mod]);
    }
    for (let i = 0; byte_array[i] === 0; i++) {
      list.push(alphabet[0]);
    }
    return list.reverse().join('');
  }

  function base58_decode_to_byte_array(str, letters = B58_ALPHABET) {
    if (str.length === 0)
      return new Uint8Array([]);
    const bytes = [0];
    for (let i = 0; i < str.length; i++) {
      var char = str[i];
      var value = letters.indexOf(char);
      if (value === undefined) {
	throw new Error(`base58.decode received invalid input '${char}'`);
      }
      for (let j = 0; j < bytes.length; j++) {
	bytes[j] *= 58;
      }
      bytes[0] += value;
      let carry = 0;
      for (let j = 0; j < bytes.length; j++) {
	bytes[j] += carry;
	carry = bytes[j] >> 8;
	bytes[j] &= 0xff;
      }
      while (carry > 0) {
	bytes.push(carry & 0xff);
	carry >>= 8;
      }
    }
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
      bytes.push(0);
    }
    return new Uint8Array(bytes.reverse());
  }

  function read_file_as_byte_array( file ){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(evt){
        if (evt.target.error) {
          reject(evt.target.error);
        } else {
          resolve( new Uint8Array(evt.target.result) );
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function byte_array_to_blob( byte_array ){
    return new Blob( byte_array );
  }

  function create_blob_from_dict(dict, formatted, media_type){
    var json = formatted ? JSON.stringify(dict, null, 1) : JSON.stringify(dict);
    return new Blob([json], {type: media_type || 'application/json;charset=utf-8'})
  }

  function create_blob_from_byte_array(byte_array, media_type = "application/octet-stream"){
    return new Blob([byte_array], {type: media_type})
  }

  function create_blob_from_string(str, media_type = "text/plain"){
    return new Blob([str], {type: media_type })
  }


  return {
    base64url_encode,
    base64url_decode,
    base64_encode_byte_array,
    base64url_encode_byte_array,
    base64_decode_to_byte_array,
    base64url_decode_to_byte_array,
    encode_byte_arrays_in_dict,
    decode_byte_arrays_in_dict,

    string_to_byte_array,
    byte_array_to_string,

    hex_to_byte_array,
    byte_array_to_hex,

    bigint_to_byte_array,
    byte_array_to_bigint,

    base58_encode_byte_array,
    base58_decode_to_byte_array,

    read_file_as_byte_array,

    create_blob_from_byte_array,
    create_blob_from_string,
    create_blob_from_dict

  };
})();
