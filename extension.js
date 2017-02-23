/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require, exports, module) {
  "use strict";

  var extensionID = "editorHTML"; // ID should be equal to the directory name where the ext. is located
  var extensionSupportedFileTypes = ["html", "htm"];

  console.log("Loading " + extensionID);

  var TSCORE = require("tscore");
  var extensionsPath = TSCORE.Config.getExtensionPath();
  var extensionDirectory = extensionsPath + "/" + extensionID;
  var fileDirectory;
  var currentContent;
  var currentFilePath;
  var $containerElement;
  var contentVersion = 0;
  var sourceURL = "";
  var scrappedOn = "";

  function init(filePath, containerElementID) {
    console.log("Initalization HTML Editor...");

    fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(filePath);

    $containerElement = $('#' + containerElementID);

    currentFilePath = filePath;

    $containerElement.empty();
    $containerElement.css("background-color", "white");

    var extPath = extensionDirectory + "/index.html";
    $containerElement.append($('<iframe>', {
      id: "iframeViewer",
      sandbox: "allow-same-origin allow-scripts allow-modals",
      scrolling: "no",
      style: "background-color: white; overflow: hidden;",
      src: extPath + "?cp=" + filePath + "&setLng=" + TSCORE.currentLanguage,
      "nwdisable": "",
      "nwfaketop": ""
    }));

    TSCORE.IO.loadTextFilePromise(filePath).then(function(content) {
        exports.setContent(content);
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Loading " + filePath + " failed.");
        console.error("Loading file " + filePath + " failed " + error);
      });
  }

  function setFileType(fileType) {

    console.log("setFileType not supported on this extension");
  }

  function viewerMode(isViewerMode) {
    // set readonly
    console.log("viewerMode not supported on this extension");
  }

  function setContent(content) {
    currentContent = content;

    var bodyContent;
    var cleanedBodyContent;
    var bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m; // jshint ignore:line

    replaceImgSrcToDataURL(content);

    if (content.length > 3) {
      try {
        bodyContent = content.match(bodyRegex)[1];
      } catch (e) {
        console.log("Error parsing the body of the HTML document. " + e);
        bodyContent = content;
      }

      try {
        var scrappedOnRegex = /data-scrappedon='([^']*)'/m; // jshint ignore:line
        scrappedOn = content.match(scrappedOnRegex)[1];
      } catch (e) {
        console.log("Error parsing the meta from the HTML document. " + e);
      }

      try {
        var sourceURLRegex = /data-sourceurl='([^']*)'/m; // jshint ignore:line
        sourceURL = content.match(sourceURLRegex)[1];
      } catch (e) {
        console.log("Error parsing the meta from the HTML document. " + e);
      }

      //var titleRegex = /\<title[^>]*\>([^]*)\<\/title/m;
      //var titleContent = content.match( titleRegex )[1];

      // removing all scripts from the document
    } else {
      currentContent = TSCORE.Config.DefaultSettings.newHTMLFileContent;
      bodyContent = currentContent.match(bodyRegex)[1];
    }
    cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    var contentWindow = document.getElementById("iframeViewer").contentWindow;
    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(cleanedBodyContent, currentFilePath);
    } else {
      // TODO optimize setTimeout
      window.setTimeout(function() {
        contentWindow.setContent(cleanedBodyContent, currentFilePath);
      }, 500);
    }
  }

  function getContent() {
    $("#iframeViewer").contents().find(".note-editable .tsCheckBox").each(function() {
      $(this).attr("disabled", "disabled");
    });

    var content = $("#iframeViewer").contents().find(".note-editable").html();

    $("#iframeViewer").contents().find(".note-editable .tsCheckBox").each(function() {
      $(this).removeAttr("disabled");
    });

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
    return htmlContent;
  }

  function getDataURL(url) {
    return new Promise(function(resolve, reject) {
      var image = new Image();

      image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        // Get raw image data
        //resolve(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

        // ... or get as Data URI
        resolve(canvas.toDataURL('image/png'));
      };

      image.src = url;
      console.log(url)
    });
  }

  function replaceImgSrcToDataURL(content) {
    // saving all images as png in base64 format
    var match;
    var urls = [];
    var imgUrl = "";
    var regEx = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;
    var htmlContent = "";

    while (match = regEx.exec(content)) {
      //console.log(match)
      imgUrl = match[1];
      //console.log("URLs: " + imgUrl);
      console.log(getDataURL(imgUrl))
      //getDataURL(imgUrl);
      if (imgUrl.indexOf('data:image') === 0) {
        // Ignore data url
      } else {
        //console.log(TSCORE.Utils.getBase64Image(imgUrl))
        urls.push([imgUrl, getDataURL(imgUrl)]);
      }

    }
    //console.debug(urls)
    urls.forEach(function(dataURLObject) {
      htmlContent = content.replace(regEx, dataURLObject[1]);

      if (dataURLObject[1].length > 7) {
        //content = content.split(dataURLObject[0]).join(dataURLObject[1]);
      }

      //console.log(dataURLObject[0]+" - "+dataURLObject[1]);
    });

    console.log('============')
    console.log(htmlContent)
    //console.log(content)
    console.log('============')
  }

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
  exports.setFileType = setFileType;

});
