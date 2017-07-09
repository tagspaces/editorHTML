/* globals marked */
"use strict";

var isCordova = parent.isCordova;
var $htmlEditor;

function initEditor() {
  var toolbar = [
    ['todo', ['checkbox', 'toggleSelectAllButton']],
    ['style', ['style']],
    ['color', ['color']],
    ['font', ['bold', 'italic', 'underline']],
    ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
    ['fontname', ['fontname']],
    ['fontsize', ['fontsize']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['height', ['height']],
    ['table', ['table']],
    ['insert', ['link', 'picture', 'hr']], // 'video',
    ['view', ['codeview']], // 'fullscreen',
    ['help', ['help']]
  ];

  if (isCordova) {
    toolbar = [
      ['todo', ['checkbox', 'toggleSelectAllButton']],
      ['color', ['color']],
      ['style', ['style']],
      ['para', ['paragraph', 'ul', 'ol']],
      ['font', ['bold', 'italic', 'underline']],
      //['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
      ['fontsize', ['fontsize']],
      //['height', ['height']],
      ['insert', ['picture', 'link', 'hr']],
      ['table', ['table']],
      //['view', ['codeview']]
    ];
  }

  var keyMapping = {
      pc: {
        'ENTER': 'insertParagraph',
        'CTRL+Z': 'undo',
        'CTRL+Y': 'redo',
        'TAB': 'tab',
        'SHIFT+TAB': 'untab',
        'CTRL+B': 'bold',
        'CTRL+I': 'italic',
        'CTRL+U': 'underline',
        'CTRL+SHIFT+S': 'strikethrough',
        'CTRL+BACKSLASH': 'removeFormat',
        'CTRL+SHIFT+L': 'justifyLeft',
        'CTRL+SHIFT+E': 'justifyCenter',
        'CTRL+SHIFT+R': 'justifyRight',
        'CTRL+SHIFT+J': 'justifyFull',
        'CTRL+SHIFT+NUM7': 'insertUnorderedList',
        'CTRL+SHIFT+NUM8': 'insertOrderedList',
        'CTRL+SHIFT+TAB': 'outdent',
        'CTRL+TAB': 'indent',
        'CTRL+NUM0': 'formatPara',
        'CTRL+NUM1': 'formatH1',
        'CTRL+NUM2': 'formatH2',
        'CTRL+NUM3': 'formatH3',
        'CTRL+NUM4': 'formatH4',
        'CTRL+NUM5': 'formatH5',
        'CTRL+NUM6': 'formatH6',
        'CTRL+ENTER': 'insertHorizontalRule',
        'CTRL+K': 'linkDialog.show'
      },

      mac: {
        'ENTER': 'insertParagraph',
        'CMD+Z': 'undo',
        'CMD+SHIFT+Z': 'redo',
        'TAB': 'tab',
        'SHIFT+TAB': 'untab',
        'CMD+B': 'bold',
        'CMD+I': 'italic',
        'CMD+U': 'underline',
        'CMD+SHIFT+S': 'strikethrough',
        'CMD+BACKSLASH': 'removeFormat',
        'CMD+SHIFT+L': 'justifyLeft',
        'CMD+SHIFT+E': 'justifyCenter',
        'CMD+SHIFT+R': 'justifyRight',
        'CMD+SHIFT+J': 'justifyFull',
        'CMD+SHIFT+NUM7': 'insertUnorderedList',
        'CMD+SHIFT+NUM8': 'insertOrderedList',
        'CMD+SHIFT+TAB': 'outdent',
        'CMD+TAB': 'indent',
        'CMD+NUM0': 'formatPara',
        'CMD+NUM1': 'formatH1',
        'CMD+NUM2': 'formatH2',
        'CMD+NUM3': 'formatH3',
        'CMD+NUM4': 'formatH4',
        'CMD+NUM5': 'formatH5',
        'CMD+NUM6': 'formatH6',
        'CMD+ENTER': 'insertHorizontalRule',
        'CMD+K': 'linkDialog.show'
      }
  };

  $htmlEditor.summernote({
    focus: true,
    height: "200px",
    disableDragAndDrop: true,
    toolbar: toolbar,
    keyMap: keyMapping,
    callbacks: {
      onChange: function(contents, $editable) {
        //console.log('onChange:', contents, $editable);
        var msg = {command: "contentChangedInEditor" , filepath: ""};
        window.parent.postMessage(JSON.stringify(msg) , "*");
      }
    }
  });

  // set note-editable panel-body to window height initially and on frame resize
  $(".note-editable.panel-body").height(window.innerHeight - 80);
  $(window).on('resize', function() {
    $(".note-editable.panel-body").height(window.innerHeight - 80);
    //console.log(window.innerHeight);
  });
}

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var locale = getParameterByName("locale");

  // Init internationalization
  $.i18n.init({
    ns: {namespaces: ['ns.editorHTML']} ,
    debug: true ,
    lng: locale ,
    fallbackLng: 'en_US'
  } , function() {
    $('[data-i18n]').i18n();
  });
});

function setContent(content, currentFilePath) {
  // adjusting relative paths
  //$("base").attr("href", currentFilePath);

  $htmlEditor = $('#htmlEditor');
  $htmlEditor.append(content);

  $htmlEditor.find(".tsCheckBox").each(function() {
    $(this).removeAttr("disabled");
  });

  // Check if summernote is loaded
  if (typeof $htmlEditor.summernote === 'function') {
    initEditor();
  } else {
    // window.setTimeout(initEditor(), 1000);
  }
}
