'use strict';

if (typeof(WebUtil)=="undefined"){
  WebUtil = {};
}

WebUtil.HTML_Util=(function(){

  function _is_unsafe_anchor(anchor_element){
    var url1 = anchor_element.getAttribute("href");
    var url2 = decodeURIComponent( anchor_element.href );
    return url1 !== url2 && url1+"/" !== url2;;
  }

  function get_meta(name) {
    var metas = document.getElementsByTagName('meta');
      for (var i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === name) {
          return metas[i].getAttribute('content');
        }
      }
    return '';
  }

  function linkify_text(string) { // returns document fragment
    var words = string.split(' '), ret = document.createDocumentFragment();
    var elm;
    for (var i = 0, l = words.length; i < l; i++) {
      elm = null;
      var word = words[i];
      var quote = "";
      if (word.match(/^`.*`$/)){
        quote = "`";
      }
      if (quote){
        word = word.substr(1, word.length-2);
      }
      if (word.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)) {
        elm = document.createElement('a');
        elm.href = word;
        elm.textContent = word;
        elm.setAttribute("rel","noopener noreferrer");
        elm.setAttribute("target","_blank");
        if (_is_unsafe_anchor(elm)){
          elm = null;
          //console.log("is unsafe");
        }
      }
      if (elm){
        if (ret.childNodes.length > 0) {
          ret.lastChild.textContent += ' '+quote;
        }
        ret.appendChild(elm);
        if (quote){
          ret.lastChild.textContent += quote;
        }
      } else {
        if (ret.lastChild && ret.lastChild.nodeType === 3) {
          ret.lastChild.textContent += ' ' + quote+word+quote;
        } else {
          ret.appendChild(document.createTextNode(' ' + quote+word+quote));
        }
      }
    }
    return ret;
  }

  function linkify(container){
    var text = container.textContent;
    while (container.hasChildNodes()) { // empty container 
      container.removeChild(container.lastChild);
    }
    container.appendChild(linkify_text(text));
  }

  function encode_html_entities(str){
    var encoded_str = str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });
    return encoded_str;
  }

  return {
    linkify,
    linkify_text,
    get_meta: get_meta,
    encode_html_entities,
  };
})();
