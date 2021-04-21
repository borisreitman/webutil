'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.Crypt_Util=(function(){
  var crypto_subtle = crypto.subtle || crypto.webkitSubtle;

  function _get_byte_array(str) {
    return new TextEncoder("utf-8").encode(str);
  }

  function _get_string_from_byte_array(byte_array) {
    return new TextDecoder("utf-8").decode(byte_array);
  }

  async function get_jwk(key_obj){
     return crypto.subtle.exportKey("jwk", key_obj);
  }

  function sha256_byte_array(data){
		return crypto.subtle.digest({ name: "SHA-256", }, data).then(function(array_buffer){
		  return new Uint8Array(array_buffer);
		})
  }

  // HMAC-SHA256

  function get_hmac_key(key_byte_array, disable_extracting){ // 32-byte long byte array
    return crypto_subtle.importKey(
      "raw",
      key_byte_array,
      { 
        name: "HMAC",
        hash: {name: "SHA-256"},
      },
      !disable_extracting,
      ["sign", "verify"]
    )
  }

  function hmac_sign(key_info, str){
    return hmac_sign_byte_array(key_info, _get_byte_array(str));
  }

  function hmac_sign_byte_array(hmac_key, data){
    return crypto.subtle.sign(
      {
        name: "HMAC",
      },
      hmac_key,
      data //ArrayBuffer of data you want to sign
    )
    .then(function(signature){
      return new Uint8Array(signature);
    })
  }

  function hmac_verify_byte_array(hmac_key, signature, data){
    return crypto_subtle.verify({ name: "HMAC" }, hmac_key, signature.buffer, data.buffer);
  }

  function hmac_verify(hmac_key, signature, str){
    return hmac_verify_byte_array(hmac_key, signature, _get_byte_array(str));
  }


  // ECDH

  function get_dh_key(jwk, disable_extracting) {
    return crypto.subtle.importKey("jwk", jwk,
      {
          name: "ECDH",
          namedCurve: "P-256",
      },
      !disable_extracting,
      jwk.key_ops //"deriveKey" and/or "deriveBits" for private keys only (empty list if importing a public key)
    );
  }

  function derive_dh_shared_secret(private_key, public_key) {
    var result = {};
    return crypto.subtle.deriveBits(
      {
        name: "ECDH",
        namedCurve: "P-256",
        public: public_key, //ECDH public key from generateKey or importKey
      },
      private_key, //ECDH private key from generateKey or importKey
      256
    ).then(function(shared_bits_array_buffer){
      return new Uint8Array(shared_bits_array_buffer);
    });
  }

  function generate_dh_keypair(disable_extracting) {
     return crypto.subtle.generateKey({name:"ECDH", namedCurve: "P-256"}, !disable_extracting, ["deriveKey","deriveBits"]);
  }

  // AES 256 GCM

  function get_symmetric_key_from_string(key_str, disable_extracting){
    // first convert str into a full jwk key, with all the right options
    var key_jwk = {
      k: key_str,
      alg: "A256GCM",
      ext: true,
      kty: "oct",
      key_ops:["encrypt","decrypt","wrapKey","unwrapKey"]
    };
    return get_symmetric_key(key_jwk, disable_extracting);
  }

  function get_symmetric_key_from_byte_array(key_byte_array, disable_extracting){
    return crypto_subtle.importKey(
      "raw", //can be "jwk" or "raw"
      key_byte_array,
      { name: "AES-GCM" },
      !disable_extracting,
      ["encrypt","decrypt","wrapKey","unwrapKey"]
    );
  }

  function get_symmetric_key(key_jwk, disable_extracting){
    // first convert str into a full jwk key, with all the right options
    return crypto.subtle.importKey("jwk", key_jwk, { name: "AES-GCM" }, !disable_extracting, ["encrypt","decrypt","wrapKey","unwrapKey"]);
  }

  function symmetric_encrypt(key, nonce, str){
    return symmetric_encrypt_byte_array(key, nonce, _get_byte_array(str));
  }

  function symmetric_encrypt_byte_array(key, nonce, data){
    return crypto_subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        tagLength: 128,
      },
      key,
      data
    )
    .then(function(encrypted){
      return new Uint8Array(encrypted);
    })
  }

  function symmetric_decrypt_byte_array(key, nonce, data){
    return crypto_subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        tagLength: 128,
      },
      key,
      data
    )
    .then(function(decrypted){
      return new Uint8Array(decrypted);
    });
  }

  function symmetric_decrypt(key, nonce, data){
    return symmetric_decrypt_byte_array(key, nonce, data).then(function(byte_array){
      return _get_string_from_byte_array(byte_array);
		});
  }

  function generate_symmetric_key(disable_extracting){
    return crypto_subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256, 
      },
      !disable_extracting,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    )
  }


  // Wrapping and Unwrapping keys

  function wrap_symmetric_key(wrapping_key, nonce, key_to_wrap){
    return crypto_subtle.wrapKey(
      "raw", //can be "jwk", "raw", "spki", or "pkcs8"
      key_to_wrap,
      wrapping_key, //the AES-GCM key with "wrapKey" usage flag
      {   //these are the wrapping key's algorithm options
          name: "AES-GCM",
          iv: nonce,
          tagLength: 128,
      }
    ).then(function(wrapped){
      return new Uint8Array(wrapped);
    });
  }

	function unwrap_symmetric_key(unwrapping_key, nonce, ciphered_key, disable_extracting){ // unwrapping_key is CryptoKey type
		return crypto_subtle.unwrapKey(
			"raw", //can be "jwk", "raw", "spki", or "pkcs8"
			ciphered_key.buffer,
			unwrapping_key, //the AES-GCM key with "wrapKey" usage flag
			{   //these are the wrapping key's algorithm options
					name: "AES-GCM",
					iv: nonce,
					tagLength: 128
			},
			{   //this what you want the wrapped key to become (same as when wrapping)
					name: "AES-GCM",
					length: 256
			},
			!disable_extracting, 
			["encrypt", "decrypt", "wrapKey", "unwrapKey"]
		)
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

  //https://stackoverflow.com/questions/17171542/algorithm-for-elliptic-curve-point-compression
  function compress_ecc_coord(x,y){
    var compressed = new Uint8Array( x.length + 1 );

    compressed[0] = 2 + ( y[ y.length-1 ] & 1 );
    compressed.set( x, 1 );

    return compressed;
  }


  function decompress_ecc_coord(compressed, a, b, p, sqrt_exponent){
    /* 
      Assumes formula is y^2 = x^3 + ax + b (mod p)

      - a, b, and p must be of BigInt type
      - sqrt_exponent must be equal to: (p+1)/4
      - compressed is a byte array, the return value from compress_ecc_coord(x,y)

      returns [x,y] where the coordinates are byte arrays
    */

    // The first byte must be 2 or 3. 4 indicates an uncompressed key, and anything else is invalid.
    var sign_y = compressed[0] - 2;
    var x_byte_array = compressed.subarray(1);
    var x = byte_array_to_bigint( x_byte_array );

    // compute y^2 = x^3 - 3x + b
    var y_squared = x**BigInt(3) % p;
    y_squared = (y_squared + a*x) % p
    y_squared = (y_squared + b) % p

    // raising y_squared to the special power of (p+1)/4 yields one of its square roots.
    var y = bigint_mod_pow( y_squared, sqrt_exponent, p );

    // if the parity does not match, then it is the other root
    if ( y % 2n !== sign_y ) {
      y = p - y;
    }

    var y_byte_array = bigint_to_byte_array(y);

    return [ x_byte_array, y_byte_array ];
  }

  function bigint_mod_pow(a, b, n) { // a^b mod n
    a = a % n;
    var result = 1n;
    var x = a;
    while (b > 0) {
      var leastSignificantBit = b % 2n;
      b = b / 2n;
      if (leastSignificantBit == 1n) {
        result = result * x;
        result = result % n;
      }
      x = x * x;
      x = x % n;
    }
    return result;
  }

  var _ecc_p256;

  function _init_ecc_p256(){
    if (_ecc_p256){
      return;
    }
    const prime = 2n**256n - 2n**224n + 2n**192n + 2n**96n - 1n;
    _ecc_p256 = {
      prime,
      sqrt_exponent: (prime+1n)/4n,
      a: -3n,
      b: BigInt( '41058363725152142129326129780047268409114441015993725554835256314039467401291' )
    };
  }

  function compress_p256_ecc_coord(x,y){
    return compress_ecc_coord(x, y);
  }

  function decompress_ecc_p256_coord( compressed ){
    _init_ecc_p256();
    var L=_ecc_p256;
    return decompress_ecc_coord(compressed, L['a'], L['b'], L['prime'], L['sqrt_exponent']);
  }

  return {
    get_jwk,
    sha256_byte_array,

    //HMAC
    get_hmac_key,
    hmac_verify_byte_array,
    hmac_sign_byte_array,
    hmac_sign,
    hmac_verify,

    // ECDH
    get_dh_key,
    generate_dh_keypair,
    derive_dh_shared_secret,

    // AES
    symmetric_encrypt,
    symmetric_decrypt,
    symmetric_encrypt_byte_array,
    symmetric_decrypt_byte_array,
    get_symmetric_key_from_string,
    get_symmetric_key_from_byte_array,
    get_symmetric_key,
    generate_symmetric_key,

    wrap_symmetric_key,
    unwrap_symmetric_key,

    compress_ecc_coord,
    decompress_ecc_coord,
    decompress_ecc_p256_coord

  };
})();
