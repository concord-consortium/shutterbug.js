(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["shutterbug"] = factory(require("jquery"));
	else
		root["Shutterbug"] = factory(root["jQuery"]);
})(self, (__WEBPACK_EXTERNAL_MODULE_jquery__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/default-server.js":
/*!******************************!*\
  !*** ./js/default-server.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Production:
var DEFAULT_SERVER = 'https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production'; // Staging:
// const DEFAULT_SERVER = 'https://dgjr6g3z30.execute-api.us-east-1.amazonaws.com/staging'
// Local:
// const DEFAULT_SERVER = 'http://localhost:4000'

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DEFAULT_SERVER);

/***/ }),

/***/ "./js/html-tools.js":
/*!**************************!*\
  !*** ./js/html-tools.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cloneDomItem": () => (/* binding */ cloneDomItem),
/* harmony export */   "generateFullHtmlFromFragment": () => (/* binding */ generateFullHtmlFromFragment),
/* harmony export */   "getDataURL": () => (/* binding */ getDataURL)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);

function cloneDomItem($elem, elemTag) {
  var $returnElm = jquery__WEBPACK_IMPORTED_MODULE_0___default()(elemTag);
  $returnElm.addClass($elem.attr('class'));
  $returnElm.attr('id', $elem.attr('id'));
  $returnElm.attr('style', $elem.attr('style'));
  $returnElm.css('background', $elem.css('background'));
  $returnElm.attr('width', $elem.width());
  $returnElm.attr('height', $elem.height());
  return $returnElm;
} // element should be an instance of Canvas or Video element (element supported as an input to Canvas.drawImage method).
// In some cases dataURL should be rescaled down to real size of the element (high DPI displays).
// It doesn't make sense to send original data, as it might be really large and cause issues while rendering page on
// AWS Lambda.

function getDataURL(element) {
  // Always use png to support transparent background.
  var format = 'image/png';
  var realWidth = jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).width();
  var realHeight = jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).height(); // When element hasn't been added to DOM, realWidth and realHeight will be equal to 0.

  var realDimensionsAvailable = realWidth > 0 && realHeight > 0;
  var widthAttr = Number(jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).attr('width')) || realWidth;
  var heightAttr = Number(jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).attr('height')) || realHeight;

  if (!realDimensionsAvailable || realWidth === widthAttr && realHeight === heightAttr) {
    return element.toDataURL(format);
  } // Scale down image to its real size.


  var canvas = document.createElement('canvas');
  canvas.width = realWidth;
  canvas.height = realHeight;
  var ctx = canvas.getContext('2d'); // Other canvas or video element can be used as a source in .drawImage.

  ctx.drawImage(element, 0, 0, realWidth, realHeight);
  return canvas.toDataURL(format);
}
function generateFullHtmlFromFragment(fragment) {
  return "\n    <!DOCTYPE html> \n    <html> \n    <head> \n      <base href=\"".concat(fragment.base_url, "\"> \n      <meta content=\"text/html;charset=utf-8\" http-equiv=\"Content-Type\"> \n      <title>content from ").concat(fragment.base_url, "</title> \n      ").concat(fragment.css, " \n    </head> \n      <body> \n        ").concat(fragment.content, " \n      </body> \n    </html>\n   ");
}

/***/ }),

/***/ "./js/replace-blobs-with-data-urls.js":
/*!********************************************!*\
  !*** ./js/replace-blobs-with-data-urls.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ replaceBlobsWithDataURLs)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* eslint-env browser */
 // Downloads `blobURL` and provides object with mapping to dataURL format.
// Async function, returns $.Deferred instance that will be resolved with the mapping.

function convertBlobToDataURL(blobURL) {
  var requestDeferred = new (jquery__WEBPACK_IMPORTED_MODULE_0___default().Deferred)();
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var reader = new FileReader();
      reader.addEventListener('loadend', function () {
        requestDeferred.resolve({
          blobURL: blobURL,
          dataURL: reader.result
        });
      });
      reader.readAsDataURL(this.response);
    }
  };

  xhr.open('GET', blobURL);
  xhr.responseType = 'blob';
  xhr.send();
  return requestDeferred;
} // Converts all the blob URLs (e.g. "blob:http://examples.com/abc-def-ghi") in `htmlString` to data URLs.
// Async function, returns $.Deferred instance that will be resolved with the final HTML.


function replaceBlobsWithDataURLs(htmlString) {
  var deferred = new (jquery__WEBPACK_IMPORTED_MODULE_0___default().Deferred)();
  var blobURLs = htmlString.match(/["']blob:.*?["']/gi);

  if (blobURLs === null) {
    // Nothing to do.
    deferred.resolve(htmlString);
    return deferred;
  }

  var blobRequests = blobURLs // .slice(1, -1) removes " or ' from the URI.
  .map(function (blobURLWithQuotes) {
    return blobURLWithQuotes.slice(1, -1);
  }).map(function (blobURL) {
    return convertBlobToDataURL(blobURL);
  });
  jquery__WEBPACK_IMPORTED_MODULE_0___default().when.apply((jquery__WEBPACK_IMPORTED_MODULE_0___default()), blobRequests).done(function () {
    // Convert arguments to real Array instance.
    var mappings = Array.prototype.slice.call(arguments);
    var newHtmlString = htmlString;
    mappings.forEach(function (mapping) {
      newHtmlString = newHtmlString.replace(mapping.blobURL, mapping.dataURL);
    });
    deferred.resolve(newHtmlString);
  });
  return deferred;
}

/***/ }),

/***/ "./js/shutterbug-worker.js":
/*!*********************************!*\
  !*** ./js/shutterbug-worker.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ShutterbugWorker)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _html_tools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./html-tools */ "./js/html-tools.js");
/* harmony import */ var _replace_blobs_with_data_urls__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./replace-blobs-with-data-urls */ "./js/replace-blobs-with-data-urls.js");
/* harmony import */ var _default_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./default-server */ "./js/default-server.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }





var MAX_TIMEOUT = 1500; // Shutterbug backend URL can be overwritten for testing using SERVER_URL_PARAM_NAME query param.
// Eg ?shutterbugUrl=https://dgjr6g3z30.execute-api.us-east-1.amazonaws.com/staging

var SERVER_URL_PARAM_NAME = "shutterbugUrl"; // Each shutterbug instance on a single page requires unique ID (iframe-iframe communication).

var _id = 0;

function getID() {
  return _id++;
}

function getURLParam(name) {
  var url = (self || window).location.href;
  name = name.replace(/[[]]/g, "\\$&");
  var regex = new RegExp("[#?&]".concat(name, "(=([^&#]*)|&|#|$)"));
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return true;
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getCSSString() {
  // originally this was
  // $('<div>').append($('link[rel="stylesheet"]').clone()).append($('style').clone()).html()
  // but that missed any rules added with insertRule
  // start out the result with all of the remote style sheets
  var result = jquery__WEBPACK_IMPORTED_MODULE_0___default()('<div>').append(jquery__WEBPACK_IMPORTED_MODULE_0___default()('link[rel="stylesheet"]').clone()); // document.styleSheets[1].cssRules[0].cssText

  for (var i = 0; i < document.styleSheets.length; i++) {
    var sheet = document.styleSheets[i]; // skip the sheets that are <link.. elements

    if (sheet.href !== null) {
      continue;
    }

    var cssText = "";
    var styleElement = jquery__WEBPACK_IMPORTED_MODULE_0___default()('<style>').attr('type', sheet.type);

    for (var j = 0; j < sheet.cssRules.length; j++) {
      styleElement.append(sheet.cssRules[j].cssText + "\n");
    }

    result.append(styleElement);
  }

  return result.html();
}

var ShutterbugWorker = /*#__PURE__*/function () {
  function ShutterbugWorker(options) {
    _classCallCheck(this, ShutterbugWorker);

    var opt = options || {};

    if (!opt.selector) {
      throw new Error('missing required option: selector');
    } // Remember that selector is anything accepted by jQuery, it can be DOM element too.


    this.element = opt.selector;
    this.callback = opt.done;
    this.failCallback = opt.fail;
    this.alwaysCallback = opt.always;
    this.imgDst = opt.dstSelector;
    this.server = getURLParam(SERVER_URL_PARAM_NAME) || opt.server || _default_server__WEBPACK_IMPORTED_MODULE_3__["default"];
    this.id = getID();
    this.iframeReqTimeout = MAX_TIMEOUT; // Bind and save a new function, so it works well with .add/removeEventListener().

    this._postMessageHandler = this._postMessageHandler.bind(this);
  }

  _createClass(ShutterbugWorker, [{
    key: "enableIframeCommunication",
    value: function enableIframeCommunication() {
      var _this = this;

      jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).ready(function () {
        window.addEventListener('message', _this._postMessageHandler, false);
      });
    }
  }, {
    key: "disableIframeCommunication",
    value: function disableIframeCommunication() {
      window.removeEventListener('message', this._postMessageHandler, false);
    }
  }, {
    key: "getDomSnapshot",
    value: function getDomSnapshot() {
      var _this2 = this;

      this.enableIframeCommunication(); // !!!

      var timerID = null;

      if (this.imgDst) {
        // Start timer and update destination element.
        var time = 0;
        var counter = jquery__WEBPACK_IMPORTED_MODULE_0___default()('<span>');
        counter.html(time);
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(this.imgDst).html('Creating snapshot: ').append(counter);
        timerID = setInterval(function () {
          time = time + 1;
          counter.html(time);
        }, 1000);
      } // Ask for HTML fragment and render it on server.


      this.getHtmlFragment(function (htmlData) {
        jquery__WEBPACK_IMPORTED_MODULE_0___default().ajax({
          url: _this2.server + '/make-snapshot',
          type: 'POST',
          data: JSON.stringify(htmlData)
        }).done(function (msg) {
          if (_this2.callback) {
            _this2.callback(msg.url);
          }

          if (_this2.imgDst) {
            jquery__WEBPACK_IMPORTED_MODULE_0___default()(_this2.imgDst).html("<img src=".concat(msg.url, ">"));
          }
        }).fail(function (jqXHR, textStatus, errorThrown) {
          if (_this2.failCallback) {
            _this2.failCallback(jqXHR, textStatus, errorThrown);
          }

          if (_this2.imgDst) {
            jquery__WEBPACK_IMPORTED_MODULE_0___default()(_this2.imgDst).html("Snapshot failed");
          }

          console.error(textStatus, errorThrown);
        }).always(function () {
          clearInterval(timerID);

          _this2.disableIframeCommunication(); // !!!


          if (_this2.alwaysCallback) {
            _this2.alwaysCallback();
          }
        });
      });
    } // Most important method. Returns HTML, CSS and dimensions of the snapshot.

  }, {
    key: "getHtmlFragment",
    value: function getHtmlFragment(callback) {
      var _this3 = this;

      var self = this;
      var $element = jquery__WEBPACK_IMPORTED_MODULE_0___default()(self.element); // .find('iframe').addBack("iframe") handles two cases:
      // - element itself is an iframe - .addBack('iframe')
      // - element descendants are iframes - .find('iframe')

      var $iframes = $element.find('iframe').addBack('iframe');
      this._iframeContentRequests = [];
      $iframes.each(function (i, iframeElem) {
        // Note that position of the iframe is used as its ID.
        _this3._postHtmlFragRequestToIframe(iframeElem, i);
      }); // Continue when we receive responses from all the nested iframes.
      // Nested iframes descriptions will be provided as arguments.

      jquery__WEBPACK_IMPORTED_MODULE_0___default().when.apply((jquery__WEBPACK_IMPORTED_MODULE_0___default()), this._iframeContentRequests).done(function () {
        $element.trigger('shutterbug-saycheese');
        var clonedElement = $element.clone(); // remove all script elements from the clone we don't want the html fragment
        // changing itself

        clonedElement.find('script').remove(); // Nested iframes.

        if (arguments.length > 0) {
          var nestedIFrames = arguments; // This supports two cases:
          // - clonedElement itself is an iframe - .addBack('iframe')
          // - clonedElement descendants are iframes - .find('iframe')

          clonedElement.find('iframe').addBack('iframe').each(function (i, iframeElem) {
            // When iframe doesn't support Shutterbug, request will timeout and null will be received.
            // In such case just ignore this iframe, we won't be able to render it.
            if (nestedIFrames[i] == null) return;
            jquery__WEBPACK_IMPORTED_MODULE_0___default()(iframeElem).attr('srcdoc', (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.generateFullHtmlFromFragment)(nestedIFrames[i]));
          });
        } // Canvases.
        // .addBack('canvas') handles case when the clonedElement itself is a canvas.


        var replacementCanvasImgs = $element.find('canvas').addBack('canvas').map(function (i, elem) {
          var dataUrl = (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.getDataURL)(elem);
          var img = (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.cloneDomItem)(jquery__WEBPACK_IMPORTED_MODULE_0___default()(elem), '<img>');
          img.attr('src', dataUrl);
          return img;
        });

        if (clonedElement.is('canvas')) {
          clonedElement = replacementCanvasImgs[0];
        } else {
          clonedElement.find('canvas').each(function (i, elem) {
            jquery__WEBPACK_IMPORTED_MODULE_0___default()(elem).replaceWith(replacementCanvasImgs[i]);
          });
        } // Video elements.
        // .addBack('video') handles case when the clonedElement itself is a video.


        var replacementVideoImgs = [];
        $element.find('video').addBack('video').map(function (i, elem) {
          var $elem = jquery__WEBPACK_IMPORTED_MODULE_0___default()(elem);
          var canvas = (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.cloneDomItem)($elem, '<canvas>');
          canvas[0].getContext('2d').drawImage(elem, 0, 0, $elem.width(), $elem.height());

          try {
            var dataUrl = (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.getDataURL)(canvas[0]);
            var img = (0,_html_tools__WEBPACK_IMPORTED_MODULE_1__.cloneDomItem)($elem, '<img>');
            img.attr('src', dataUrl);
            replacementVideoImgs.push(img);
          } catch (e) {
            // If the video isn't hosted on the same site this will catch the security error
            // and push null to signal it doesn't need replacing.  We don't use the return
            // value of map() as returning null confuses jQuery.
            replacementVideoImgs.push(null);
          }
        });

        if (clonedElement.is('video')) {
          if (replacementVideoImgs[0]) {
            clonedElement = replacementVideoImgs[0];
          }
        } else {
          clonedElement.find('video').each(function (i, elem) {
            if (replacementVideoImgs[i]) {
              jquery__WEBPACK_IMPORTED_MODULE_0___default()(elem).replaceWith(replacementVideoImgs[i]);
            }
          });
        }

        clonedElement.css({
          // Make sure that clonedElement will be positioned in the top-left corner of the viewport.
          'top': 0,
          'left': 0,
          'transform': 'translate3d(0, 0, 0)',
          'margin': 0,
          // Dimensions need to be set explicitly (e.g. otherwise 50% width wouldn't work as expected).
          'width': $element.width(),
          'height': $element.height()
        });
        var htmlString = jquery__WEBPACK_IMPORTED_MODULE_0___default()('<div>').append(clonedElement).html();
        var cssString = getCSSString(); // Process HTML and CSS content when it's a string. Some operations are easier when we can use regular expressions
        // instead of traversing the DOM using jQuery.

        var htmlDeferred = (0,_replace_blobs_with_data_urls__WEBPACK_IMPORTED_MODULE_2__["default"])(htmlString);
        var cssDeferred = (0,_replace_blobs_with_data_urls__WEBPACK_IMPORTED_MODULE_2__["default"])(cssString);
        jquery__WEBPACK_IMPORTED_MODULE_0___default().when(htmlDeferred, cssDeferred).done(function (processedHTMLString, processedCssString) {
          var htmlData = {
            content: processedHTMLString,
            css: processedCssString,
            width: $element.outerWidth(),
            height: $element.outerHeight(),
            base_url: window.location.href
          };
          $element.trigger('shutterbug-asyouwere');
          callback(htmlData);
        });
      });
    } // frame-iframe communication related methods:
    // Basic post message handler.

  }, {
    key: "_postMessageHandler",
    value: function _postMessageHandler(message) {
      function handleMessage(message, type, handler) {
        var data = message.data;

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);

            if (data.type === type) {
              handler(data, message.source);
            }
          } catch (e) {// Not a json message. Ignore it. We only speak json.
          }
        }
      }

      handleMessage(message, 'htmlFragRequest', this._htmlFragRequestHandler.bind(this));
      handleMessage(message, 'htmlFragResponse', this._htmlFragResponseHandler.bind(this));
    } // Iframe receives question about its content.

  }, {
    key: "_htmlFragRequestHandler",
    value: function _htmlFragRequestHandler(data, source) {
      // Update timeout. When we receive a request from parent, we have to finish nested iframes
      // rendering in that time. Otherwise parent rendering will timeout.
      // Backward compatibility: Shutterbug v0.1.x don't send iframeReqTimeout.
      this.iframeReqTimeout = data.iframeReqTimeout != null ? data.iframeReqTimeout : MAX_TIMEOUT;
      this.getHtmlFragment(function (html) {
        var response = {
          type: 'htmlFragResponse',
          value: html,
          iframeReqId: data.iframeReqId,
          id: data.id // return to sender only

        };
        source.postMessage(JSON.stringify(response), '*');
      });
    } // Parent receives content from iframes.

  }, {
    key: "_htmlFragResponseHandler",
    value: function _htmlFragResponseHandler(data) {
      if (data.id === this.id) {
        // Backward compatibility: Shutterbug v0.1.x don't send iframeReqId.
        var iframeReqId = data.iframeReqId != null ? data.iframeReqId : 0;

        this._iframeContentRequests[iframeReqId].resolve(data.value);
      }
    } // Parent asks iframes about their content.

  }, {
    key: "_postHtmlFragRequestToIframe",
    value: function _postHtmlFragRequestToIframe(iframeElem, iframeId) {
      var message = {
        type: 'htmlFragRequest',
        id: this.id,
        iframeReqId: iframeId,
        // We have to provide smaller timeout while sending message to nested iframes.
        // Otherwise, when one of the nested iframes timeouts, then all will do the
        // same and we won't render anything - even iframes that support Shutterbug.
        iframeReqTimeout: this.iframeReqTimeout * 0.6
      };
      iframeElem.contentWindow.postMessage(JSON.stringify(message), '*');
      var requestDeferred = new (jquery__WEBPACK_IMPORTED_MODULE_0___default().Deferred)();
      this._iframeContentRequests[iframeId] = requestDeferred;
      setTimeout(function () {
        // It handles a situation in which iframe doesn't support Shutterbug.
        // When we doesn't receive answer for some time, assume that we can't
        // render this particular iframe (provide null as iframe description).
        if (requestDeferred.state() !== 'resolved') {
          requestDeferred.resolve(null);
        }
      }, this.iframeReqTimeout);
    }
  }]);

  return ShutterbugWorker;
}();



/***/ }),

/***/ "jquery":
/*!******************************************************************************************!*\
  !*** external {"root":"jQuery","commonjs2":"jquery","commonjs":"jquery","amd":"jquery"} ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_jquery__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shutterbug_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shutterbug-worker */ "./js/shutterbug-worker.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }


 // Used by enable and disable functions.

var iframeWorker = null;

function parseSnapshotArguments(args) {
  // Remember that selector is anything accepted by jQuery, it can be DOM element too.
  var selector;
  var doneCallback;
  var dstSelector;
  var options = {};

  function assignSecondArgument(arg) {
    if (typeof arg === 'string') {
      dstSelector = arg;
    } else if (typeof arg === 'function') {
      doneCallback = arg;
    } else if (_typeof(arg) === 'object') {
      options = arg;
    }
  }

  if (args.length === 3) {
    options = args[2];
    assignSecondArgument(args[1]);
    selector = args[0];
  } else if (args.length === 2) {
    assignSecondArgument(args[1]);
    selector = args[0];
  } else if (args.length === 1) {
    options = args[0];
  }

  if (selector) {
    options.selector = selector;
  }

  if (doneCallback) {
    options.done = doneCallback;
  }

  if (dstSelector) {
    options.dstSelector = dstSelector;
  }

  return options;
} // Public API:


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  snapshot: function snapshot() {
    var options = parseSnapshotArguments(arguments);
    var shutterbugWorker = new _shutterbug_worker__WEBPACK_IMPORTED_MODULE_1__["default"](options);
    shutterbugWorker.getDomSnapshot();
  },
  enable: function enable(selector) {
    this.disable();
    selector = selector || 'body';
    iframeWorker = new _shutterbug_worker__WEBPACK_IMPORTED_MODULE_1__["default"]({
      selector: selector
    });
    iframeWorker.enableIframeCommunication();
  },
  disable: function disable() {
    if (iframeWorker) {
      iframeWorker.disableIframeCommunication();
      iframeWorker = null;
    }
  },
  // Supported events:
  // 'saycheese' - triggered before snapshot is taken
  // 'asyouwere' - triggered after snapshot is taken
  on: function on(event, handler) {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).on('shutterbug-' + event, handler);
  },
  off: function off(event, handler) {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).off('shutterbug-' + event, handler);
  }
});
})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=shutterbug.js.map