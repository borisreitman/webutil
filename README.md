# webutil
Web Development utilities

Contains various groupings of functions to achieve common tasks in web development.



## URL_Util

Allows to manipulate query parameters of a URL. Parameters are called *options*.

```
  <script src="web_util/url_util.js"></script>
  <script>
    const { URL_Util } = WebUtil;
    let query = location.search.substr(1);
    console.log(URL_Util.decode_url_options(query));
  </script>
```


### decode_url_options(url_query) 

Returns a dictionary

```
  var options = decode_url_options("a=b&c=d")
  console.log(options.c); // d
```

### encode_url_options(dict) 

Returns url query 

```
  var query = encode_url_options({a:'b', c:'d'})
  console.log(query); // a=b&c=d
```

### add_option_to_url(url, name, value)

Sets an URL parameter on a URL. 

```
  console.log( add_option_to_url("https://example.com/a", "foo", "bar"))         // ?foo=bar
  console.log( add_option_to_url("https://example.com/a?foo=bar", "foo", "baz")) // ?foo=baz
```


### is_url(str)

Checks if `str` looks like a URL.



## HTML_Util

Helper functions to work with current page loaded in the browser.

## linkify(element)

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

## linkify_text(string)

Returns a document fragment in which URLs have been converted into `A` anchor tags with the urls set in the `href` attribute.

```
  <script>
    const { linkify_text } = WebUtil.HTML_Util;
    document.body.appendChild( linkify_text("Go to https://example.com") )
  </script>
```

### get_meta(name):

Get meta tag of a certain name. Returns the value of the `content` attribute of the meta tag.

### encode_html_entities(html)

Replaces unsafe HTML characters with their safer equivalents.



## Date_Util

Function that helps to present dates to end user

The `current_date` parameter should be set to current time `new Date()`. It's left configurable for unit testing purposes.

```
const { Date_Util } = WebUtil;

var date = new Date();
date.setDate(date.getDate() - 1)

console.log( Date_Util.time_ago( date, new Date() ) ) // "1 day ago"
```

### short_date(past_date, current_date)

Format date and time of a date object as consisely as possible, loosing precision when the date is too distant relative to the current date.

### time_ago(past_date, current_date)

Like short_date but shows date in terms of how many days, months, years ago it was.

### time_remaining_util(future_date, current_date)

Opposite of `time_ago`. You can use this to display time remaining until expiration. 

### date_str_to_epoch("YYYY/MM/DD")

Takes in a string formatted as above. Gives time in Unix Epoch of a certain date.

### date_to_epoch(date_obj)

Converts JavaScript Date object to Unix epoch time.



## Rand_Util

Useful random functions. 

```
const { Rand_Util } = WebUtil;

console.log( Rand_Util.random_hex_string() ) // f5b2aa71fb6c5e2da20291e6c6047d43
```

### random_hex_string(length = 32)

Uses `crypto.getRandomValues` to generate a strong random string in which every two characters is a hex code. You can get a shorter equivalent string with the same entropy if you "compress" it by hashing it.
