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

## linkify(root_element)

Will find all URLs in HTML and turn them into links. Use this in order to avoid
generating links on the server side. Doing it on client side prevents Cross Site
Scripting attacks.

```
  <div id="$foo">
    Go to https://example.com
  </div>
  <script>
    var { HTML_Util } = WebUtil;
    HTML_Util.linkify($foo);
  </script>
```

### get_meta(name):
  
Get meta tag of a certain name. Returns the value of the `content` attribute of
the meta tag.

### encode_html_entities(html)

Replaces unsafe HTML characters with their safer equivalents.
