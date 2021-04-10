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

  return {
    get_hmac_key,
    hmac_verify_byte_array,
    hmac_sign_byte_array,
    hmac_sign,
    hmac_verify
  };
})();
