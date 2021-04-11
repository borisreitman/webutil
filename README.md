# webutil
Web Development utilities

Contains various groupings of functions to achieve common tasks in web development.



## URL Utilities

Allows to manipulate query parameters of a URL. Parameters are called *options*.

```
  <script src="web_util/url_util.js"></script>
  <script>
    const { URL_Util } = WebUtil;
    let query = location.search.substr(1);
    console.log(URL_Util.decode_url_options(query));
  </script>
```


##### decode_url_options(url_query) 

Returns a dictionary

```
  var options = decode_url_options("a=b&c=d")
  console.log(options.c); // d
```

##### encode_url_options(dict) 

Returns url query 

```
  var query = encode_url_options({a:'b', c:'d'})
  console.log(query); // a=b&c=d
```

##### add_option_to_url(url, name, value)

Sets an URL parameter on a URL. 

```
  console.log( add_option_to_url("https://example.com/a", "foo", "bar"))         // ?foo=bar
  console.log( add_option_to_url("https://example.com/a?foo=bar", "foo", "baz")) // ?foo=baz
```


##### is_url(str)

Checks if `str` looks like a URL.



## HTML Utilities

Helper functions to work with current page loaded in the browser.

##### linkify(element)

Use this in order to avoid generating links on the server side. Doing it on client side prevents Cross Site Scripting attacks. Apply this on an element containing only text.

```
  <div id="$foo">
    Go to https://example.com
  </div>
  <script>
    const { HTML_Util } = WebUtil;
    HTML_Util.linkify($foo);
  </script>
```

##### linkify_text(string)

Returns a document fragment in which URLs have been converted into `A` anchor tags with the urls set in the `href` attribute.

```
  <script>
    const { linkify_text } = WebUtil.HTML_Util;
    document.body.appendChild( linkify_text("Go to https://example.com") )
  </script>
```

##### get_meta(name):

Get meta tag of a certain name. Returns the value of the `content` attribute of the meta tag.

##### encode_html_entities(html)

Replaces unsafe HTML characters with their safer equivalents.



## Date Utilities

Function that helps to present dates to end user

The `current_date` parameter should be set to current time `new Date()`. It's left configurable for unit testing purposes.

```
const { Date_Util } = WebUtil;

var date = new Date();
date.setDate(date.getDate() - 1)

console.log( Date_Util.time_ago( date, new Date() ) ) // "1 day ago"
```

##### short_date(past_date, current_date)

Format date and time of a date object as consisely as possible, loosing precision when the date is too distant relative to the current date.

##### time_ago(past_date, current_date)

Like short_date but shows date in terms of how many days, months, years ago it was.

##### time_remaining_util(future_date, current_date)

Opposite of `time_ago`. You can use this to display time remaining until expiration. 

##### date_str_to_epoch("YYYY/MM/DD")

Takes in a string formatted as above. Gives time in Unix Epoch of a certain date.

##### date_to_epoch(date_obj)

Converts JavaScript Date object to Unix epoch time.



## Randomization Utilities

Useful random functions. 

```
const { Rand_Util } = WebUtil;

console.log( Rand_Util.random_hex_string() ) // f5b2aa71fb6c5e2da20291e6c6047d43
```

##### random_bytes(length)

Uses `crypto.getRandomValues` to generate a strong random bytes, and returns it as UInt8Array.

##### random_hex_string(length = 32)

Uses `crypto.getRandomValues` to generate a strong random string in which every two characters is a hex code. You can get a shorter equivalent string with the same entropy if you "compress" it by hashing it.



## Network Utilities

Downloading and fetching data

```
const { Net_Util } = WebUtil;
```

##### fetch_as_byte_array(url, options)

Calls `fetch` to GET the URL, then formats result as byte array. Returns a Promise.

```
var url = "https://code.jquery.com/jquery-3.6.0.slim.min.js";
var bytes = await Net_Util.fetch_as_byte_array( url, {
  integrity: 'sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI='  
});
```



## Data Utilities

Various data format conversions.  Use these functions to encode raw binary data, such as raw cryptogarphic keys, if you need to send them over the network.

Note that there is a difference between Base64 encoded string, and a  Base64-URL encoded string.
string.  In particular, JSON Web Keys (JWK) use the Base64-URL encoding to represent keys (the `k` field).

All functions are synchronous.

##### base64_url_encode( base64_string )

Takes an already Base64 encoded string, and converts it into Base64-URL encoded
string. 

##### base64_url_decode( string )

Takes an a Base64-URL encoded string, and returns a Base64 encoded string.

##### base64_encode_byte_array( byte_array )

Encodes byte array to base64.

##### base64_url_encode_byte_array( byte_array )

Use this to strigify raw cryptographic material in one function call. 

##### base64_decode_to_byte_array( str )

Decodes a Base64 encoded string to a Uint8Array.


##### encode_byte_arrays_in_dict( dict )

Pass a javascript Object for which some values are of type Uint8Array. Replaces values with byte arrays with a Base64 data: URL equivalent. Returns a shallow copy of the dict.  Note: it doesn't descent into nested elements to look for byte arrays.

Use this function to encode byte arrays returned by cryptographic functions.

##### decode_byte_arrays_in_dict( dict )

The opposite operation. Returns a shallow copy of the dict.  It doesn't descent into nested elements to look for encoded byte arrays.



## Cryptographic Utilities

The cryptographic utilities assist you to communicate security over the Internet, and are broken into three parts. 

First, the HMAC utilities are there to allow you to communicate public information with authenticity verification. You may want to use this to communicate things like public keys, email addresses, phone numbers, and cryptocurrency addresses. The information is not secret, but it needs to make to the other side unmodified. 

Second part contains utility functions for a Diffie-Hellman exchange.  Use this to establish a shared secret over insecure communication channel with the other party.  The shared secret can be either used to form an HMAC key, or to form an AES key (or both).  The shared secret is of size 32 bytes, which works for both keys. 

The third part is for symmetric encryption, which uses AES-256 GCM variant. Once you have a shared secret on both sides of communication, use this to encrypt and decrypt information. Every encryption call requires a nonce value which is 12 bytes long. You can use `Rand_Util.random_bytes(12)` to generate it.  You will need to pass this nonce to the other side, together with the ciphertext. 

Part of symmetric encrytion is also the ability to treat keys as data and encrypt them with another key. This second key is called Key Encryption Key (KEK). The terminology is to wrap and unwrap a key. When the key is wrapped, it can be communicated by an insecure channel. The technique of wrapping keys allows to encrypt a large file once, and send it to multiple people, each of which do not know each other's symmetric key.

All byte arrays are of type UInt8Array.  All cryptogarphic are performed using Brower's built-in facilities of the `window.crypto` API.

```
const { Crypt_Util } = WebUtil;
```

The `disable_extracting` parameter is on all the functions that create a CryptoKey object. If set to `true`, the key may not be exported from memory into JWK. (The web browser uses this for extra protectiong from Cross-Site-Scripting attacks.)

Most functions return byte arrays of type `UInt8Array`. If you need to save the results on the server, you will want to Base64 encode it.  Use helper function `encode_byte_arrays_in_dict` and the corresponding decoding function in the Data utilities above. (You will need to track both the ciphertext byte array as well as the nonce byte array, so place them in a dict and encode it.)



### HMAC Signatures

```javascript
  const { hmac_sign, hmac_verify, get_hmac_key } = WebUtil.Crypt_Util;
  var raw = Rand_Util.random_bytes(32);
  var key = await get_hmac_key(raw);
  var sig = await hmac_sign(key, "hello world")
  if (hmac_verify(key, sig, "hello world")){
    console.log("verified");
  }
```

##### get_hmac_key(byte_array, disable_extracting = false)

Expects a byte array of length 32 bytes.  You can get random bytes to use as the input here, using `Rand_Util.random_bytes(32)`.

Returns a Promise of a key object to plug into other HMAC functions.

##### hmac_sign(key, str)

Expects a key and a string. Returns a Promise of HMAC-SHA256 signature inside a byte array.

##### hmac_sign_byte_array(key, data)

Like above, but takes a byte array instead of a string. 

##### hmac_verify(key, signature, string)

Verifies an HMAC signature against another string.

##### hmac_verify_byte_array(key, signature, byte_array)

Like above, but takes a byte array instead of a string.



### Elliptic Curve Diffie-Hellman (ECDH) Exchange

Uses ECDH with the browser built-in elliptic curve `P-256`.

Note that all the functions are named `_dh_` but in fact they are doing ECDH.  Usually DH means RSA based exchange however RSA  is not desirable for a shared secret negotiation because the public keys are long.

```javascript
  const { generate_dh_keypair, derive_dh_shared_secret, get_dh_key, get_jwk } = WebUtil.Crypt_Util;
  // Alice does
  var alice_keypair = await generate_dh_keypair();
  var alice_pubkey_jwk = await get_jwk(alice_keypair.publicKey);

  // Send Alice's pub key to Bob
  // Bob does
  var bob_keypair = await generate_dh_keypair();
  var bob_pubkey_jwk = await get_jwk(bob_keypair.publicKey);

  var alice_pubkey = await get_dh_key(alice_pubkey_jwk);
  var shared_secret_raw = await derive_dh_shared_secret(bob_keypair.privateKey, alice_pubkey)

  // Send Bob's pub key to Alice
  // Alice does
  var bob_pubkey = await get_dh_key(bob_pubkey_jwk);
  var shared_secret_raw2 = await derive_dh_shared_secret(alice_keypair.privateKey, bob_pubkey)

  // both should be equal
  console.log(shared_secret_raw);
  console.log(shared_secret_raw2);
```

##### get_dh_key(jwk, disable_extracting = false)

Takes a JSON Web Key received from somewhere, and returns an ECDH CryptoKey object for use with 
other ECDH functions. Returns a Promise.

##### generate_dh_keypair(disable_extracting = false)

Generates a new ECDH private and public key, returning a dict `{ privateKey: ..., publicKey: ... }` where the values are CryptoKey objects. Returns a Promise.



### Symmetric Encryption

Uses AES-256 GCM to do the encryption, with tag length of 128.

```javascript
  const { symmetric_encrypt, generate_symmetric_key, symmetric_decrypt } = WebUtil.Crypt_Util;

  var key = await generate_symmetric_key();

  var nonce = await Rand_Util.random_bytes(12);
  var ciphertext = await symmetric_encrypt(key, nonce, "hello world")

  // send nonce and ciphertext over the network

  var plaintext = await symmetric_decrypt(key, nonce, ciphertext);
  if (plaintext == "hello world"){
    console.log("valid");
  }
```



### Combining ECDH with symmetric encryption

Use the `get_symmetric_key_from_string` function to create a key from the ECDH established shared_secret string. 

Recall that the `shared_secret_raw` value in the ECDH example was returned by the `derive_dh_shared_secret()` function. The shared bytes are precisely the right length for the AES-256 key (namely 32 bytes), and the Base64-URL encoding is what a JSON Web Key needs in the `k` field.

```javascript
  const { get_symmetric_key_from_string } = WebUtil.Crypt_Util;

  var shared_secret_raw = await derive_dh_shared_secret(bob_keypair.privateKey, alice_pubkey)
  var shared_secret = base64_url_encode_byte_array(shared_secret_raw);

  var key = await get_symmetric_key_from_string(shared_secret);
```




##### symmetric_encrypt(key, nonce, string)

Encrypts a string with AES-256 GCM encryption, using the provided `nonce` as initialization vection (the `iv` parameter). The key must be AES-256 GCM CryptoKey object. Returns a Promise.

##### symmetric_decrypt(key, nonce, byte_array)

Like above, but decrypts and returns a string. Use only if you expect that the plaintext is a string, and not a raw binary data.

##### symmetric_encrypt_byte_array(key, nonce, byte_array)

Like `symmetric_encrypt` function, but takes a byte array.

##### symmetric_decrypt_byte_array(key, nonce, byte_array)

Like `symmetric_decrypt` function, but returns a byte array instead of a string. Use this if you expect some kind of large data coming out of the decryption.

##### get_symmetric_key(disable_extracting = false)

Takes a JSON Web Key (JWK) as input, and returns an equivalent AES-GCM CryptoKey object.

##### get_symmetric_key_from_string(disable_extracting = false)

Like above, but only takes in the value for the `k` field in a JSON Web Key (JWK) data structure, and hardcodes the rest accoring to AES-256 GCM.  

You can produce this value from a random set of 32 bytes, by first encoding it using Base64-URL encoding. You can use `Data_Util.base64_url_encode_byte_array` utility function to do it.

##### get_symmetric_key_from_byte_array(byte_array, disable_extracting = false)

Pass a 32-bytes byte array and get an AES-GCM encryption key.  For example,

```
var key = await get_symmetric_key_from_byte_array( Rand_Util.random_bytes(32) );
```

You'll need this function if you are generating an encryption key from user's password using a Key Derivation Function (KDF) such as Scrypt. You'll usually get a byte array that you need to convert into a CryptoKey object.

##### generate_symmetric_key(disable_extracting = false)

Helper function to generate a new CryptoKey of type AES-256 GCM.



### Wrapping Keys

Wrapping keys with another key, known as Key-Encryption-Key (KEK), allows you to encrypt a message with a key A once and send to multiple people. All you need to do is to encrypt or "wrap" the key A with keys B1, B2, B3, corresponding to person 1, person 2, person 3 who should have access to the message. Then you send to each person the message ciphertext, as well as the wrap of the key he will need to decrypt the message. But first he would have to unwrap the key.

Because the wrapping function returns a byte array, and you probably want to send it to the server, you will need to base64 encode it.  Remember that you will need to store the nonce as well, which is also a byte array.


```
  const { wrap_symmetric_key, unwrap_symmetric_key } = WebUtil.Crypt_Util;

  var kek = await generate_symmetric_key();
  var wrapping_nonce = await Rand_Util.random_bytes(12);
  var key_ciphertext = await wrap_symmetric_key(kek, wrapping_nonce, key);
  console.log(key_ciphertext.length); // 48 bytes
  
  // Store encode_byte_arrays_in_dict({key_ciphertext, wrapping_nonce}) on server.

  var key2 = await unwrap_symmetric_key(kek, wrapping_nonce, key_ciphertext);

  var plaintext = await symmetric_decrypt(key2, nonce, ciphertext);
  if (plaintext == "hello world"){
    console.log("valid");
  }
}
```

##### wrap_symmetric_key(wrapping_key, nonce, key_to_wrap)

Both keys must be of type CryptoKey.  Returns ciphertext as a byte array, as a Promise.

##### unwrap_symmetric_key(unwrapping_key, nonce, ciphertext, disable_extracting = false)

The opposite operation. The `ciphertext` is the output of the wrapping function. (And the nonce must be the same.) Returns the original CryptoKey as a Promise.

##### get_jwk(key)

Takes a CryptoKey object, and returns its JSON Web Key encoding as a Promise.  Use this for sending a key over the network.

