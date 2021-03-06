'use strict';
var WebUtil; if (!WebUtil) WebUtil = {};

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
    string = " " + string + " ";
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
    container.appendChild( linkify_text(text) );
  }

  function encode_html_entities(str){
    var encoded_str = str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });
    return encoded_str;
  }

  function trigger_download(link_element){
    link_element.click();
  }

  function prepare_download_link(blob, filename, link_element){
    if (!link_element){
      link_element = document.createElement('a');
      link_element.className = 'blob_download_link';
      link_element.style.display = 'none';
      link_element.rel = 'noopener'; // protection from tab nabbing
      document.body.appendChild(link_element);
    }
    link_element.href = window.URL.createObjectURL(blob);
    link_element.setAttribute('download', filename||'');
    return link_element;
  }

  function click_link(node){ // from FileSave.js
    // `a.click()` doesn't work for all browsers (#465)
		try {
			node.dispatchEvent(new MouseEvent('click'))
		} catch (e) {
			var evt = document.createEvent('MouseEvents')
			evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
														20, false, false, false, false, 0, null)
			node.dispatchEvent(evt)
		}
  }


  function copy_to_clipboard( input_element ){
    input_element.select();
    document.execCommand("copy");
    input_element.blur();
  }

  function find_parent_node(node, class_name){
    var depth = 100
    while (depth > 0 && ! node.className.split(" ").includes(class_name)){
      depth--;
      node = node.parentNode;
    }
    return node;
  }

  function resize_textarea_to_fit( element ){
    element.style.height = "";
    element.style.height = element.scrollHeight + "px";
  }

  function remove_css_classes(element, list){
    var names = element.className.replace(/  +/g, " ").split(" ");
    var lookup = {};
    for (var name of names){
      lookup[name] = 1;
    }
    for (var name of list){
      delete lookup[name];
    }
    element.className = Object.keys(lookup).join(" ");
  }

  function get_dropped_files(ev){
    var files = [];

    if (ev.dataTransfer.items) { // DataTransferItemList is supported
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        let item = ev.dataTransfer.items[i]
        if (item.kind == 'file'){
          files.push( item.getAsFile() );
        }
      }
    } else { // use DataTransfer
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        files.push(file);
      }
    }
    return files;
  }

  function Upload_Error(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function group_files_by_folder(files){
    var groups = {}, ungrouped = [];
    for (var file of files){
      var path = file.webkitRelativePath.split("/");
      if (path.length > 1){ // folder
        let folder = path.shift();
        if (!groups[folder]){
          groups[folder] = [];
        }
        groups[folder].push(file);
      } else {
        ungrouped.push(files);
      }
    }
    return [ groups, ungrouped ];
  }

  function format_file_size( bytes ){
    var kb = bytes / 1024;
    var mb = kb / 1024;
    return bytes < 1024 ?  bytes+" B" :
      kb < 1024
      ? kb.toFixed(2)+" KB"
      : mb.toFixed(2)+" MB";
  }

  return {
    linkify,
    linkify_text,
    get_meta: get_meta,
    encode_html_entities,

    prepare_download_link,
    click_link,

    copy_to_clipboard,
    find_parent_node,

    resize_textarea_to_fit,
    remove_css_classes,

    group_files_by_folder,
    get_dropped_files,
    format_file_size
  };
})();
