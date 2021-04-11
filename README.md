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


#### decode_url_options(url_query) 

Returns a dictionary

```
  var options = decode_url_options("a=b&c=d")
  console.log(options.c); // d
```

#### encode_url_options(dict) 

Returns url query 

```
  var query = encode_url_options({a:'b', c:'d'})
  console.log(query); // a=b&c=d
```

#### add_option_to_url(url, name, value)

Sets an URL parameter on a URL. 

```
  console.log( add_option_to_url("https://example.com/a", "foo", "bar"))         // ?foo=bar
  console.log( add_option_to_url("https://example.com/a?foo=bar", "foo", "baz")) // ?foo=baz
```


#### is_url(str)

Checks if `str` looks like a URL.



## HTML Utilities

Helper functions to work with current page loaded in the browser.

#### linkify(element)

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

#### linkify_text(string)

Returns a document fragment in which URLs have been converted into `A` anchor tags with the urls set in the `href` attribute.

```
  <script>
    const { linkify_text } = WebUtil.HTML_Util;
    document.body.appendChild( linkify_text("Go to https://example.com") )
  </script>
```

#### get_meta(name):

Get meta tag of a certain name. Returns the value of the `content` attribute of the meta tag.

#### encode_html_entities(html)

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

#### short_date(past_date, current_date)

Format date and time of a date object as consisely as possible, loosing precision when the date is too distant relative to the current date.

#### time_ago(past_date, current_date)

Like short_date but shows date in terms of how many days, months, years ago it was.

#### time_remaining_util(future_date, current_date)

Opposite of `time_ago`. You can use this to display time remaining until expiration. 

#### date_str_to_epoch("YYYY/MM/DD")

Takes in a string formatted as above. Gives time in Unix Epoch of a certain date.

#### date_to_epoch(date_obj)

Converts JavaScript Date object to Unix epoch time.



## Randomization Utilities

Useful random functions. 

```
const { Rand_Util } = WebUtil;

console.log( Rand_Util.random_hex_string() ) // f5b2aa71fb6c5e2da20291e6c6047d43
```

#### random_bytes(length)

Uses `crypto.getRandomValues` to generate a strong random bytes, and returns it as UInt8Array.

#### random_hex_string(length = 32)

Uses `crypto.getRandomValues` to generate a strong random string in which every two characters is a hex code. You can get a shorter equivalent string with the same entropy if you "compress" it by hashing it.



## Network Utilities

Downloading and fetching data

```
const { Net_Util } = WebUtil;
```

#### fetch_as_byte_array(url, options)

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

#### base64_url_encode( base64_string )

Takes an already Base64 encoded string, and converts it into Base64-URL encoded
string. 

#### base64_url_decode( string )

Takes an a Base64-URL encoded string, and returns a Base64 encoded string.

#### base64_encode_byte_array( byte_array )

Encodes byte array to base64.

#### base64_url_encode_byte_array( byte_array )

Use this to strigify raw cryptographic material in one function call. 

#### base64_decode_to_byte_array( str )

Decodes a Base64 encoded string to a Uint8Array.



## Cryptographic Utilities

Cryptographic operations and hashing. All byte arrays are of type UInt8Array.  All cryptogarphic are performed using Brower's built-in facilities of the `window.crypto` API.

```
const { Crypt_Util } = WebUtil;
```





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

#### get_hmac_key(byte_array, disable_extracting = false)

Expects a byte array of length 32 bytes.  You can get random bytes to use as the input here, using `Rand_Util.random_bytes(32)`.

Returns a Promise of a key object to plug into other HMAC functions.

#### hmac_sign(key, str)

Expects a key and a string. Returns a Promise of HMAC-SHA256 signature inside a byte array.

#### hmac_sign_byte_array(key, data)

Like above, but takes a byte array instead of a string. 

#### hmac_verify(key, signature, string)

Verifies an HMAC signature against another string.

#### hmac_verify_byte_array(key, signature, byte_array)

Like above, but takes a byte array instead of a string.



### Elliptic Curve Diffie-Hellman (ECDH) Exchange

Uses ECDH with the browser built-in elliptic curve `P-256`.

Note that all the functions are named `_dh_` but in fact they are doing ECDH. 
Usually DH means RSA based exchange however RSA  is not desirable for a shared secret negotiation 
because the public keys are long.

```javascript
  const { generate_dh_keypair, derive_dh_session, get_dh_key, get_jwk } = WebUtil.Crypt_Util;
  // Alice does
  var alice_keypair = await generate_dh_keypair();
  var alice_pubkey_jwk = await get_jwk(alice_keypair.publicKey);

  // Send Alice's pub key to Bob
  // Bob does
  var bob_keypair = await generate_dh_keypair();
  var bob_pubkey_jwk = await get_jwk(bob_keypair.publicKey);

  var alice_pubkey = await get_dh_key(alice_pubkey_jwk);
  var session_raw = await derive_dh_session(bob_keypair.privateKey, alice_pubkey)

  // Send Bob's pub key to Alice
  // Alice does
  var bob_pubkey = await get_dh_key(bob_pubkey_jwk);
  var session_raw2 = await derive_dh_session(alice_keypair.privateKey, bob_pubkey)

  // both should be equal
  console.log(session_raw);
  console.log(session_raw2);
```

#### get_dh_key(jwk, disable_extracting = false)

Takes a JSON Web Key received from somewhere, and returns an ECDH CryptoKey object for use with 
other ECDH functions. Returns a Promise.

#### generate_dh_keypair(disable_extracting = false)

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

Use the `get_symmetric_key_from_string` function to create a key from the ECDH established session string. 

Recall that the `session_raw` value in the ECDH example was returned by the `derive_dh_session()` function. The shared bytes are precisely the right length for the AES-256 key (namely 32 bytes), and the Base64-URL encoding is what a JSON Web Key needs in the `k` field.

```javascript
  const { get_symmetric_key_from_string } = WebUtil.Crypt_Util;

  var session_raw = await derive_dh_session(bob_keypair.privateKey, alice_pubkey)
  var session = base64_url_encode_byte_array(session_raw);

  var key = await get_symmetric_key_from_string(session);
```




#### symmetric_encrypt(key, nonce, string)

Encrypts a string with AES-256 GCM encryption, using the provided `nonce` as
initialization vection (the `iv` parameter). The key must be AES-256 GCM CryptoKey object. Returns a Promise.

#### symmetric_decrypt(key, nonce, byte_array)

Like above, but decrypts and returns a string. Use only if you expect that the plaintext is a string, 
and not a raw binary data.

#### symmetric_encrypt_byte_array(key, nonce, byte_array)

Like `symmetric_encrypt` function, but takes a byte array.

#### symmetric_decrypt_byte_array(key, nonce, byte_array)

Like `symmetric_decrypt` function, but returns a byte array instead of a string.
Use this if you expect some kind of large data coming out of the decryption.

#### get_symmetric_key(disable_extracting = false)

Takes a JSON Web Key (JWK) as input, and returns an equivalent AES-GCM CryptoKey object.

#### get_symmetric_key_from_string(disable_extracting = false)

Like above, but only takes in the value for the `k` field in a JSON Web Key (JWK) data structure, and hardcodes the rest accoring to AES-256 GCM.  

You can produce this value from a random set of 32 bytes, by first encoding it using Base64-URL encoding. You can use `Data_Util.base64_url_encode_byte_array` utility function to do it.

#### generate_symmetric_key(disable_extracting = false)

Helper function to generate a new CryptoKey of type AES-256 GCM.

#### get_jwk(key)

Takes a CryptoKey object, and returns its JSON Web Key encoding as a Promise. 
Use this for sending a key over the network.