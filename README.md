# webutil - Web Development Utilities
## Overview

Contains various groupings of functions to achieve common tasks in web development. Note that the separate modules have no cross dependencies. 

This code is provided for educational purposes. You can use it as is, or copy-paste function implementations that are relevant to your project.

Note that the cryptographic functions largely rely on browser's built-in implementation. You still need to have a clue about how it all works, otherwise you may misuse them.

Brief summary of utility groups:

* URL utilities -- parsing of URL parameters
* HTML utilities - DOM manipulation, escaping special characters, etc.
* Date utilities - show dates in a user friendly consise way (e.g. "1 day ago")
* Randomization utilities -- random strings and random bytes
* Network utilities -- fetching remote resources
* Data utilities -- serialization and deserialization of byte arrays
* Cryptographic utilities -- encrypt and decrypt in the browser, when not trusting the server.

See external <a href="https://borisreitman.com/privacy.html">cryptography demo</a>.


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

##### get_meta(name)

Get a meta tag of a certain name. Returns the value of the `content` attribute of the meta tag.

##### encode_html_entities(html)

Replaces unsafe HTML characters with their safer equivalents.


##### prepare_download_link(blob, filename = null, link_element = null)

Initializes a link element with attributes which would trigger a file download, when the link is clicked. If the link element is not passed, a new invisible element is created and appended to the end of the page. 

Returns the link element. 

The filename is optional, and will result in adding the `download` attribute to the link tag set to the filename. Otherwise, the browser will pick a filename itself. 

To trigger the download programmatically, call `click_link( element )` function.

Note: The Blob object must have a content type set on it.

Note: No "Save As" dialog would be presented. If you want it, use the <a href="https://github.com/eligrey/FileSaver.js">FileSaver.js</a> library by Eli Grey until browsers implement `window.saveAs( blob, filename )` function from HTML5.

##### click_link(link_element)

Use with links returned by `prepare_download_link`.  Equivalent to `a.click()` but works in all browers to trigger download.

##### copy_to_clipboard( input_element )

Takes an input element, and copies what's inside into to clipboard.

##### find_parent_node( node, class_name )

Searches elements up the DOM hierarchy, until it finds an element with a given CSS class.

##### resize_textarea_to_fit( textarea_node )

You can call this function on every input event. It will make sure that the text
area expands or collapses to wrap the text. It will not collapse more than its
original size. Only resizes he height, doesn't touch the width.

##### remove_css_classes( element, names )

The `names` is a list of classes to remove. Does not return anything, but modifies the element's `className` property.

If you do not have JQuery loaded, this a helper function that can help you swap one class with another, without affecting any other CSS classes that are set.

##### get_dropped_files( event )

Use inside `drop` event handler, and pass the event object to this function.
Returns a array of File objects dropped.

##### group_files_by_folder( files )

Use this to group file list resulting from multiple directory upload. Pass `event.target.files` to it.
Returns a list `[ folders_dict, individual_files ]`. The entries inside the folders dictionary are flattened.

##### format_file_size( size_in_bytes )

Returns user friendly size in appropirate units. If the size is larger than 1024 bytes, it will return it in kilobytes. If it is larger than 1 MB it will return it in megabytes.

## Date Utilities

Functions that help present dates to end user in a concise, easily understoond way.

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

Note that there is a difference between Base64 encoded string, and a  Base64-URL encoded string.  In particular, JSON Web Keys (JWK) use the Base64-URL encoding to represent keys.

Almost all functions are synchronous.

##### base64url_encode( base64_string )

Takes an already Base64 encoded string, and converts it into Base64-URL encoded
string. 

##### base64url_decode( string )

Takes an a Base64-URL encoded string, and returns a Base64 encoded string.

##### base64_encode_byte_array( byte_array )

Encodes byte array to base64.

##### base64url_encode_byte_array( byte_array )

Use this to strigify raw cryptographic material in one function call. 

##### base64_decode_to_byte_array( str )

Decodes a Base64 encoded string to a Uint8Array.

##### base64url_decode_to_byte_array( str )

Like above, but assumes input is in Base64 URL encoding.

Decodes a Base64 encoded string to a Uint8Array.

##### base58_encode_byte_array( str, alphabet = BITCOIN_BASE58 )

Encode a byte array into Base58 representation. By default uses Bitcoin's
alphabet, but allows you to override it.

##### base58_decode_from_byte_array( str, alphabet = BITCOIN_BASE58 )

Opposite operation from above.

##### encode_byte_arrays_in_dict( dict )

Pass a javascript Object for which some values are of type Uint8Array. Replaces values with byte arrays with a Base64 data: URL equivalent. Returns a shallow copy of the dict.  Note: it doesn't descent into nested elements to look for byte arrays.

Use this function to encode byte arrays returned by cryptographic functions.

##### decode_byte_arrays_in_dict( dict )

The opposite operation. Returns a shallow copy of the dict.  It doesn't descent into nested elements to look for encoded byte arrays.


##### string_to_byte_array( string, encoding = 'utf-8' )

Takes a string and returns a byte array that represents it.

##### byte_array_to_string( encoding = 'utf-8' )

The opposite to above function.

##### hex_to_byte_array( hex_string )

If the hex string is not of even length, it will first left-pad it with a zero.
Then it will convert every two characters to a byte, and stuff it into a byte
array of half the length of the original hex string.

##### byte_array_to_hex( hex_string )

The opposite operation from above. The resulting hex string will be of even length.

##### bigint_to_byte_array( integer )

Will convert a large integer of type BigInt to a Big Endian byte array equivalent.

##### int_to_byte_array( integer, size = 0)

Will convert a regular integer to byte array, and will use up `size` bytes to do it if size is a positive number.  Otherwise, will use the smallest number of bytes needed.

##### byte_array_to_int( byte_array )

The opposite operation to above.

##### byte_array_to_bigint( byte_array )

The opposite operation from above.  The byte array must be Big Endian.

##### create_blob_from_string(string, content_type = "plain/text;charset=utf-8")

Wrapper on Blob constructor.

##### create_blob_from_byte_array(byte_array, content_type = "application/octet-stream")

Wrapper on Blob constructor.

##### create_blob_from_dict(dict, content_type = "application/json;charset=utf-8")

Wrapper on Blob constructor. Creates a Blob containing a JSON string, after serializing the `dict ` with `JSON.stringify`.

##### concatenate_byte_arrays(...list)

Returns a new UInt8Array which is a concatenation of input arrays of the same type.

##### unpack_byte_array(byte_array, ...sizes)

Splits input byte array according to size specification. For example, if sizes are 2, 3, 4 it will return a list of three byte arrays with these sizes respectively. Use this to unpack a header form a body in a binary packet of data. 

If after all parts were unpacked, there is more left in the byte array, it will be returned as an additional part. So you never need to specify the length of the last part. Usually, you have a fixed sized header, and everything else is body. So, you do not need to specify the size of the variable body.

##### auto_pack_byte_arrays(byte_arrays, slot_size = 3)

Will allocate slot_size bytes to encode the size of each byte array, which will become
the header. Another slot_size bytes encodes the total number of byte arrays, and
is placed before the header. The remaning will be the concatenation of byte arrays.

##### auto_unpack_byte_arrays(byte_arrays, slot_size = 3)

The opposite operation to above. Specify the same slot size.

##### pack_named_byte_arrays([[ name, byte_array], ...])

Receives a list, each element of which contains a name and a byte array. It
packs it into a single byte array. Use this to pack directory of files into a
single byte array.

##### unpack_named_byte_arrays(packed)

The opposite operation to above. Returns the same kind of list.

##### class Crc32

Incrementally calculate a `Crc32` checksum. 

```
  var crc = new Crc32();
  crc.append(byte_array1)
  crc.append(byte_array2)
  ...
  console.log("result", crc.get())
```

##### class Memory_Zip

Use this class to create a ZIP file from files represented as byte arrays. There is no compression, and Zip64 is not supported, so there is a 4GB size limit.  Example:

```
  var zipper = new Memory_Zip()
  zipper.add( "foo/bar.txt",     string_to_byte_array("hello" ), Date.now())
  zipper.add( "foo/baz/bud.txt", string_to_byte_array("world!"), Date.now())
  ...
  var byte_array = zipper.get_zipped()
```

##### zip_files()

Wrapper on above class. Receives a list of File objects, and returns a Promise of a 
byte array of the zip.

##### read_file_as_byte_array( file )

The `file` parameter is of type `File` which is what you get when a file is
dropped or selected in file upload. Returns a Promise.


## Cryptographic Utilities

```
const { Crypt_Util } = WebUtil;
```

The cryptographic utilities assist you to communicate securely over the Internet. The web browser supports cryptographic operations natively, and uses the `CryptoKey` class to represent encryption keys of various types. While we may prefer working with cryptographic keys as strings or byte arrays, we must eventually intialize a CryptoKey object instance with the key material.

The cryptographic utilities are organized into three parts. First, the HMAC utilities are there to allow you to communicate public information with authenticity verification. You may want to use this to communicate things like public keys, email addresses, phone numbers, and cryptocurrency addresses. The information is not secret, but it needs to arrive at the recipient's side unmodified. 

Second part contains utility functions for a Diffie-Hellman exchange.  Use this to establish a shared secret over insecure communication channel with the other party.  Once the shared secret is established, it can be either used to form an HMAC key or an AES key.  Because the shared secret is of size 32 bytes, it both works for both kinds of keys. Note that the Diffie-Hellman scheme is an instance of an assymetric encryption scheme.

The third part is for symmetric encryption which uses AES-256 GCM variant. Once you have a shared secret on both sides of communication, use this to encrypt and decrypt information. Note that every encryption call requires a nonce value which is 12 bytes long. You can use `Rand_Util.random_bytes(12)` to generate it.  You will need to pass this nonce to the other side, together with the ciphertext. 

Part of symmetric encrytion pracitce is also the ability to treat keys as data and encrypt them with another key. This second key is called a Key Encryption Key (KEK), and the further terminology is to *wrap* and *unwrap* a key. When the key is wrapped, it can be communicated by an insecure channel. The technique of wrapping keys allows to encrypt a large file once, and send it to multiple people, each of whom do not know each other's symmetric key.

The `disable_extracting` parameter is on all the functions that create a CryptoKey object. If set to `true`, the key may not be exported from memory into JWK. (The web browser uses this for extra protectiong from Cross-Site-Scripting attacks.)

All cryptographic operations are performed using Brower's built-in facilities of the `window.crypto` API.  Most functions return byte arrays of type `UInt8Array`. If you need to save the results on the server, you will want to Base64 encode it.  Use helper function `encode_byte_arrays_in_dict` and the corresponding decoding function in the Data utilities above. (You will need to track both the ciphertext byte array as well as the nonce byte array, so place them in a dict and encode it.)


### HMAC Signatures

The MAC in HMAC stands for Message Authenication Code and the 'H' stands for hashing. This implementation uses SHA-256 hashing function.

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

Note that all the functions are named `_dh_` but in fact they are doing ECDH.  Usually DH means RSA based exchange however RSA  is not desirable for a shared secret negotiation because the public keys would be too long. This elliptic curve implmentation uses `x` and `y` coordinates to represent an encryption key, each of which occupies 32 bytes. When you export the keys using `get_jwk` function, you will have these coordinates each Base64-URL encoded.

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



### Coordinate Compression

Elliptic Curve (x,y) coordinates can be compressed down to (x, sign(y)), which is half the length. This makes it easier to share public keys.

Here's how to use the compression and decompression functions in a Diffie-Hellman exchange.

```javascript
  var keypair = await generate_dh_keypair();
  var jwk = await get_jwk( keypair.publicKey );
  
  var x = base64_decode_to_byte_array( jwk.x );
  var y = base64_decode_to_byte_array( jwx.y );

  var compressed = compress_ecc_p256_coord(x, y);

  compressed = base64url_encode_byte_array( compressed );
  // send compressed as DH-offer

  // on the receiving end, decompress

  compressed = base64_decode_to_byte_array( compressed );
  var [x, y] = decompress_p256_ecc_coord( compressed );
```

##### compress_ecc_coord(x, y)

Compresses coordinate (x,y) represented as byte arrays to a byte array that is
one byte larger than the length of `x`. 

##### decompress_ecc_coord( byte_array, a, b, p, sqrt_exponent )

Opposite operation from the above function. Returns `[x, y]` which is an array of two elements. Each of the elements is a byte array. 

- The input byte array must be the output of the above `compress_ecc_coord` function.
- Assumes the ECC formula is `y^2 = x^3 + ax + b (mod p)`
- a, b, and p must be of `BigInt` data type
- `sqrt_exponent` must be equal to: (p+1)/4

##### decompress_p256_ecc_coord( byte_array )

Calls `decompress_ecc_coord` with parameters for the ECC P-256 curve. 

Note that this is the curve that is used by the Diffie-Hellman utility functions. See code sample above on how to use compression in Diffie-Hellman exchange to shorten the public key that must be communicated.



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

Use the `get_symmetric_key_from_string` or `get_symmetric_key_from_byte_array` functions to create a key from the ECDH established shared secret.

You will most likely store the shared secret somewhere in browser session storage as string, so using the `..._from_string` variant will be more convenient.

Recall that the `shared_secret_raw` value in the ECDH example was returned by the `derive_dh_shared_secret()` function. The shared bytes are precisely the right length for the AES-256 key (namely 32 bytes), and the Base64-URL encoding is what a JSON Web Key needs in the `k` field.

```javascript
  const { get_symmetric_key_from_string } = WebUtil.Crypt_Util;
  const { base64url_encode_byte_array } = WebUtil.Data_Util;

  var shared_secret_raw = await derive_dh_shared_secret(bob_keypair.privateKey, alice_pubkey)
  var shared_secret = base64url_encode_byte_array(shared_secret_raw);

  var key = await get_symmetric_key_from_string(shared_secret);
  //OR: var key = await get_symmetric_key_from_byte_array(shared_secret_raw);
```


##### symmetric_encrypt(key, nonce, string)

Encrypts a string with AES-256 GCM encryption, using the provided `nonce` as initialization vector (the `iv` parameter). The key must be AES-256 GCM CryptoKey object. Returns a Promise.

##### symmetric_decrypt(key, nonce, byte_array)

Like above, but decrypts and returns a string. Use only if you expect that the plaintext is a string, rather than raw binary data.

##### symmetric_encrypt_byte_array(key, nonce, byte_array)

Like `symmetric_encrypt` function, but takes a byte array.

##### symmetric_decrypt_byte_array(key, nonce, byte_array)

Like `symmetric_decrypt` function, but returns a byte array instead of a string. Use this if you expect some kind of large data coming out of the decryption.

##### get_symmetric_key(disable_extracting = false)

Takes a JSON Web Key (JWK) as input, and returns an equivalent AES-GCM CryptoKey object.

##### get_symmetric_key_from_string(disable_extracting = false)

Like above, but only takes in the value for the `k` field in a JSON Web Key (JWK) data structure, and hardcodes the rest accoring to AES-256 GCM.  

You can produce this value from a random set of 32 bytes, by first encoding it using Base64-URL encoding. You can use `Data_Util.base64url_encode_byte_array` utility function to do it.

##### get_symmetric_key_from_password( password_string, iterations = 100000, salt = 0, disable_extracting = false)

Takes a string of any kind and returns a CryptoKey object. Passes it through PDKDF2 algorithm with default options that can be changed. The salt must be passed as a Uint8Array. Returns a Promise.

##### get_symmetric_key_from_byte_array(byte_array, disable_extracting = false)

Pass a 32-bytes byte array and get an AES-GCM encryption key.  For example,

```
var key = await get_symmetric_key_from_byte_array( Rand_Util.random_bytes(32) );
```

You'll need this function if you are generating an encryption key from user's password using a Key Derivation Function (KDF) such as Scrypt. You'll usually get a byte array that you need to convert into a CryptoKey object.

##### generate_symmetric_key(disable_extracting = false)

Helper function to generate a new CryptoKey of type AES-256 GCM.



### Wrapping Keys

Wrapping a key with another key, known as Key-Encryption-Key (KEK), allows you to encrypt a large file with a key once and send to multiple people. All you need to do is to encrypt or "wrap" the encryption key A with keys B1, B2, B3, corresponding to person 1, person 2, person 3 who should have access to the file. Then you send to each person the encrypted file, as well as the wrap `Wrap(A,B_i)` of the key he will need to decrypt the file. On the receiving end, the person will unwrap A using B_i and decrypt the file.

Because the wrapping function returns a byte array but you would most likely wish to send it to the server, you would need to base64 encode it.  Remember that you will need to store the nonce as well, which is also a byte array.


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

##### sha256_byte_array( byte_array )

Takes a Uint8Array of any size and returns a Promise of a SHA-256 hashcode,
represented as a Uint8Array of size 32 bytes.

