/* globals marked */
"use strict";

var isCordova = parent.isCordova;
var $htmlEditor;

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

function initEditor() {
  $htmlEditor.summernote({
    focus: true,
    height: "100%",
    disableDragAndDrop: true,
    toolbar: toolbar,
    onkeyup: function() {
      contentVersion++;
      //            window.parent.postMessage('par1', '*');
    }
  });
}

var contentVersion = 0;

function resetContentVersion() {
  contentVersion = 0;
}

function getContentVersion() {
  return contentVersion;
}

function setContent(content, currentFilePath) {
  resetContentVersion();

  // adjusting releative paths
  $("base").attr("href", currentFilePath);

  $htmlEditor = $('#htmlEditor');
  $htmlEditor.append(content);
  // Check if summernote is loaded
  if (typeof $htmlEditor.summernote === 'function') {
    initEditor();
  } else {
    // window.setTimeout(initEditor(), 1000);
  }
  
  $(document).on('drop dragend dragenter dragover', function(event) {
    event.preventDefault();
  });  
  
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
  
  $("#printButton").on("click", function() {
    $(".dropdown-menu").dropdown('toggle');
    window.print();
  });  
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