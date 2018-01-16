/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals $ isCordova sendMessageToHost initI18N getParameterByName */

'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent' });

let $htmlEditor;

function initEditor() {
  let toolbar = [
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
      // ['font2', ['superscript', 'subscript', 'strikethrough', 'clear']],
      ['fontsize', ['fontsize']],
      // ['height', ['height']],
      ['insert', ['picture', 'link', 'hr']],
      ['table', ['table']]
      // ['view', ['codeview']]
    ];
  }

  const keyMapping = {
    pc: {
      ENTER: 'insertParagraph',
      'CTRL+Z': 'undo',
      'CTRL+Y': 'redo',
      TAB: 'tab',
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
      ENTER: 'insertParagraph',
      'CMD+Z': 'undo',
      'CMD+SHIFT+Z': 'redo',
      TAB: 'tab',
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
    height: '200px',
    disableDragAndDrop: true,
    toolbar,
    keyMap: keyMapping,
    callbacks: {
      onChange: () => {
        sendMessageToHost({ command: 'contentChangedInEditor', filepath: '' });
      }
    }
  });

  // Hiding the statusbar
  $('.note-statusbar').hide();
  // extending the height of the editor to window height initially and on window resize
  $('.note-editable').height(window.innerHeight - 80);
  $(window).on('resize', () => {
    $('.note-editable').height(window.innerHeight - 80);
    console.log(window.innerHeight);
  });
}

$(document).ready(() => {
  const locale = getParameterByName('locale');
  initI18N(locale, 'ns.editorHTML.json');
});

let sourceURL = '';
let currentContent;
let scrappedOn = '';

function getContent() {
  console.log('Getting text content from editor.');
  $('.note-editable .tsCheckBox').each(() => {
    $(this).attr('disabled', 'disabled');
  });

  let content = $('.note-editable').html();

  /* Clean content

    // removing all scripts from the document
    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // saving all images as png in base64 format
    var match;
    var urls = [];
    var imgUrl = "";
    var rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

    while (match = rex.exec(cleanedContent)) {
      imgUrl = match[1];
      console.log("URLs: " + imgUrl);
      if (imgUrl.indexOf('data:image') === 0) {
        // Ignore data url
      } else {
        urls.push([imgUrl, TSCORE.Utils.getBase64Image(imgUrl)]);
      }

    }

    urls.forEach(function(dataURLObject) {
      if (dataURLObject[1].length > 7) {
        cleanedContent = cleanedContent.split(dataURLObject[0]).join(dataURLObject[1]);
      }
      //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
    });
    // end saving all images

    cleanedContent = "<body data-sourceurl='" + sourceURL + "' data-scrappedon='" + scrappedOn + "' >" + cleanedContent + "</body>";

    var indexOfBody = currentContent.indexOf("<body");
    var htmlContent = "";
    if (indexOfBody >= 0 && currentContent.indexOf("</body>") > indexOfBody) {
      htmlContent = currentContent.replace(/\<body[^>]*\>([^]*)\<\/body>/m, cleanedContent); // jshint ignore:line
    } else {
      htmlContent = cleanedContent;
    }
*/

  return content;
}

function setContent(content, filePath) {
  // adjusting relative paths
  // $('base').attr('href', currentFilePath);
  currentContent = content;

  let bodyContent;
  let cleanedContent;
  const bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m;

  if (content.length > 3) {
    try {
      bodyContent = content.match(bodyRegex)[1];
    } catch (e) {
      console.log('Error parsing the body of the HTML document. ' + e);
      bodyContent = content;
    }

    try {
      const scrappedOnRegex = /data-scrappedon='([^']*)'/m;
      scrappedOn = content.match(scrappedOnRegex)[1];
    } catch (e) {
      console.log('Error parsing the meta from the HTML document. ' + e);
    }

    try {
      const sourceURLRegex = /data-sourceurl='([^']*)'/m;
      sourceURL = content.match(sourceURLRegex)[1];
    } catch (e) {
      console.log('Error parsing the meta from the HTML document. ' + e);
    }

    // var titleRegex = /\<title[^>]*\>([^]*)\<\/title/m;
    // var titleContent = content.match( titleRegex )[1];

    // removing all scripts from the document
  } else {
    // currentContent = TSCORE.Config.DefaultSettings.newHTMLFileContent;
    try {
      bodyContent = currentContent.match(bodyRegex)[1];
    } catch (e) {
      console.log('Error parsing the meta from the HTML document. ' + e);
    }
  }
  cleanedContent = bodyContent.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // saving all images as png in base64 format
  let match;
  const urls = [];
  let imgUrl = '';
  const rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

  while ((match = rex.exec(cleanedContent))) {
    imgUrl = match[1];
    // console.log('URLs: ' + imgUrl);
    if (imgUrl.indexOf('data:image') === 0) {
      // Ignore data url
    } else {
      urls.push([imgUrl, getBase64Image(imgUrl)]);
    }
  }

  urls.forEach((dataURLObject) => {
    if (dataURLObject[1].length > 7) {
      cleanedContent = cleanedContent
        .split(dataURLObject[0])
        .join(dataURLObject[1]);
    }
    // console.log(dataURLObject[0]+' - '+dataURLObject[1]);
  });
  // end saving all images

  cleanedContent =
    "<body data-sourceurl='" +
    sourceURL +
    "' data-scrappedon='" +
    scrappedOn +
    "' >" +
    cleanedContent +
    '</body>';

  $htmlEditor = $('#htmlEditor');
  $htmlEditor.append(cleanedContent);

  $htmlEditor.find('.tsCheckBox').each(() => {
    $(this).removeAttr('disabled');
  });

  // Check if summernote is loaded
  if (typeof $htmlEditor.summernote === 'function') {
    initEditor();
  }
}
