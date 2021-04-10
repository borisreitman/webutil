'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.Crypt_Util=(function(){
  var crypto_subtle = crypto.subtle || crypto.webkitSubtle;

  function _get_byte_array(str) {
    return new TextEncoder("utf-8").encode(str);
  }


  // HMAC-SHA256

  function get_hmac_key(key_byte_array){ // 32-byte long byte array
    return crypto_subtle.importKey(
      "raw",
      key_byte_array,
      { 
        name: "HMAC",
        hash: {name: "SHA-256"},
      },
      false, // not extractable
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

  function get_dh_key(dh_public_key_jwk) {
    return crypto.subtle.importKey("jwk", dh_public_key_jwk,
      {
          name: "ECDH",
          namedCurve: "P-256",
      },
      false, //not extractable
      [] //"deriveKey" and/or "deriveBits" for private keys only (empty list if importing a public key)
    );
  }

  function derive_dh_session(private_key, public_key) {
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

  function generate_dh_keypair() {
     return crypto.subtle.generateKey({name:"ECDH", namedCurve: "P-256"}, true, ["deriveKey","deriveBits"]);
  }

  async function get_jwk(key_obj){
     return crypto.subtle.exportKey("jwk", key_obj);
  }
    
  return {
    //HMAC
    get_hmac_key,
    hmac_verify_byte_array,
    hmac_sign_byte_array,
    hmac_sign,
    hmac_verify,

    // ECDH
    get_jwk,
    get_dh_key,
    generate_dh_keypair,
    derive_dh_session

  };
})();
