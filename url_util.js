'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

WebUtil.URL_Util=(function(){

  function encode_url_options(options){
    var list = []
    for (var k in options){
      var v = options[k];
      if (Array.isArray(v)){
        for (var i=0, l=v.length; i<l; i++){
          list.push(k+"="+encodeURIComponent(v[i]));
        }
      } else {
        list.push(k+"="+encodeURIComponent(v));
      }
    }
    return list.join("&");
  }

  function is_url(word){
    if (word.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)) {
      return true;
    } else {
      return false;
    }
  }

  function decode_url_options(options_str, decode_required){
    var tokens = options_str.split("&");
    var options = {};
    for (var i=0, l=tokens.length; i<l; i++){
      var token = tokens[i];
      var pair = token.split("=");
      var k = pair[0];
      var v = pair[1]; // decodeURIComponent?
      if (decode_required){
        v = decodeURIComponent(v);
      }
      options[k] = v;
    }
    return options;
  }

  function add_option_to_url(url, name, value){
    var pos = url.indexOf("?");
    if (pos==-1){
      return url+"?"+name+"="+encodeURIComponent(value);
    }
    var base_url = url.substr(0, pos);
    var options = url.substr(pos+1);
    var parsed_options = decode_url_options(options, true);
    parsed_options[name] = value;
    return base_url+"?"+stringify_url_options(parsed_options);
  }

  return {
    is_url,
    add_option_to_url,
    encode_url_options,
    decode_url_options
  };
})();
