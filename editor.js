/* globals marked */
"use strict";

var isCordova = parent.isCordova;
var $htmlEditor;

function initEditor() {
  var toolbar = [
    ['style', ['style']],
    ['color', ['color']],
    ['font', ['bold', 'italic', 'underline']],
    ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
    ['fontname', ['fontname']],
    // ['fontsize', ['fontsize']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['height', ['height']],
    ['table', ['table']],
    ['insert', ['link', 'picture', 'hr']], // 'video',
    ['view', ['codeview']], // 'fullscreen',
    ['help', ['help']]
  ];

  if (isCordova) {
    toolbar = [
      ['color', ['color']],
      ['style', ['style']],
      ['para', ['paragraph', 'ul', 'ol']],
      ['font', ['bold', 'italic', 'underline']],
      ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
      //['fontsize', ['fontsize']],
      ['height', ['height']],
      ['insert', ['picture', 'link', 'hr']],
      ['table', ['table']],
      ['view', ['codeview']]
    ];
  }

  $htmlEditor.summernote({
    focus: true,
    height: "100%",
    disableDragAndDrop: true,
    toolbar: toolbar,
    onkeyup: function() {
      var msg = {command: "contentChangedInEditor" , filepath: ""};
      window.parent.postMessage(JSON.stringify(msg) , "*");
    },
    /*onkeydown: function(e) {
      //console.log("Keyevent " + e);
      //if((e.ctrlKey || e.metaKey) && e) {
      //var msg = {command: "saveFileInEditor" , filepath: ""};
      //window.parent.postMessage(JSON.stringify(msg) , "*");
      //}
    }*/
  });

  /*Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
    alert("Saving");
    return false;
  });*/
}

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var locale = getParameterByName("locale");

  $('#aboutExtensionModal').on('show.bs.modal', function() {
    $.ajax({
      url: 'README.md',
      type: 'GET'
    })
    .done(function(mdData) {
      //console.log("DATA: " + mdData);
      if (marked) {
        var modalBody = $("#aboutExtensionModal .modal-body");
        modalBody.html(marked(mdData, { sanitize: true }));
        handleLinks(modalBody);
      } else {
        console.log("markdown to html transformer not found");
      }
    })
    .fail(function(data) {
      console.warn("Loading file failed " + data);
    });
  });

  $(document).on('drop dragend dragenter dragover', function(event) {
    event.preventDefault();
  });

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
  // Check if summernote is loaded
  if (typeof $htmlEditor.summernote === 'function') {
    initEditor();
  } else {
    // window.setTimeout(initEditor(), 1000);
  }
}

function handleLinks($element) {
  $element.find("a[href]").each(function() {
    var currentSrc = $(this).attr("href");
    $(this).bind('click', function(e) {
      e.preventDefault();
      var msg = {command: "openLinkExternally", link : currentSrc};
      window.parent.postMessage(JSON.stringify(msg), "*");
    });
  });
}