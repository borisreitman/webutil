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

  function get_dh_key(dh_public_key_jwk, disable_extracting) {
    return crypto.subtle.importKey("jwk", dh_public_key_jwk,
      {
          name: "ECDH",
          namedCurve: "P-256",
      },
      !disable_extracting,
      [] //"deriveKey" and/or "deriveBits" for private keys only (empty list if importing a public key)
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


  return {
    get_jwk,

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
    get_symmetric_key,
    generate_symmetric_key

  };
})();
