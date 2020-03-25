(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["shutterbug"] = factory(require("jquery"));
	else
		root["Shutterbug"] = factory(root["jQuery"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_jquery__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/default-server.js":
/*!******************************!*\
  !*** ./js/default-server.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n// Production:\nvar DEFAULT_SERVER = 'https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production';\n// Staging:\n// const DEFAULT_SERVER = 'https://dgjr6g3z30.execute-api.us-east-1.amazonaws.com/staging'\n// Local:\n// const DEFAULT_SERVER = 'http://localhost:4000'\n\nexports.default = DEFAULT_SERVER;\n\n//# sourceURL=webpack://Shutterbug/./js/default-server.js?");

/***/ }),

/***/ "./js/html-tools.js":
/*!**************************!*\
  !*** ./js/html-tools.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.cloneDomItem = cloneDomItem;\nexports.getDataURL = getDataURL;\nexports.generateFullHtmlFromFragment = generateFullHtmlFromFragment;\n\nvar _jquery = __webpack_require__(/*! jquery */ \"jquery\");\n\nvar _jquery2 = _interopRequireDefault(_jquery);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction cloneDomItem($elem, elemTag) {\n  var $returnElm = (0, _jquery2.default)(elemTag);\n  $returnElm.addClass($elem.attr('class'));\n  $returnElm.attr('id', $elem.attr('id'));\n  $returnElm.attr('style', $elem.attr('style'));\n  $returnElm.css('background', $elem.css('background'));\n  $returnElm.attr('width', $elem.width());\n  $returnElm.attr('height', $elem.height());\n  return $returnElm;\n}\n\n// element should be an instance of Canvas or Video element (element supported as an input to Canvas.drawImage method).\n// In some cases dataURL should be rescaled down to real size of the element (high DPI displays).\n// It doesn't make sense to send original data, as it might be really large and cause issues while rendering page on\n// AWS Lambda.\nfunction getDataURL(element) {\n  // Always use png to support transparent background.\n  var format = 'image/png';\n  var realWidth = (0, _jquery2.default)(element).width();\n  var realHeight = (0, _jquery2.default)(element).height();\n  // When element hasn't been added to DOM, realWidth and realHeight will be equal to 0.\n  var realDimensionsAvailable = realWidth > 0 && realHeight > 0;\n  var widthAttr = Number((0, _jquery2.default)(element).attr('width')) || realWidth;\n  var heightAttr = Number((0, _jquery2.default)(element).attr('height')) || realHeight;\n  if (!realDimensionsAvailable || realWidth === widthAttr && realHeight === heightAttr) {\n    return element.toDataURL(format);\n  }\n  // Scale down image to its real size.\n  var canvas = document.createElement('canvas');\n  canvas.width = realWidth;\n  canvas.height = realHeight;\n  var ctx = canvas.getContext('2d');\n  // Other canvas or video element can be used as a source in .drawImage.\n  ctx.drawImage(element, 0, 0, realWidth, realHeight);\n  return canvas.toDataURL(format);\n}\n\nfunction generateFullHtmlFromFragment(fragment) {\n  return '\\n    <!DOCTYPE html> \\n    <html> \\n    <head> \\n      <base href=\"' + fragment.base_url + '\"> \\n      <meta content=\"text/html;charset=utf-8\" http-equiv=\"Content-Type\"> \\n      <title>content from ' + fragment.base_url + '</title> \\n      ' + fragment.css + ' \\n    </head> \\n      <body> \\n        ' + fragment.content + ' \\n      </body> \\n    </html>\\n   ';\n}\n\n//# sourceURL=webpack://Shutterbug/./js/html-tools.js?");

/***/ }),

/***/ "./js/index.js":
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nvar _jquery = __webpack_require__(/*! jquery */ \"jquery\");\n\nvar _jquery2 = _interopRequireDefault(_jquery);\n\nvar _shutterbugWorker = __webpack_require__(/*! ./shutterbug-worker */ \"./js/shutterbug-worker.js\");\n\nvar _shutterbugWorker2 = _interopRequireDefault(_shutterbugWorker);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Used by enable and disable functions.\nvar iframeWorker = null;\n\nfunction parseSnapshotArguments(args) {\n  // Remember that selector is anything accepted by jQuery, it can be DOM element too.\n  var selector = void 0;\n  var doneCallback = void 0;\n  var dstSelector = void 0;\n  var options = {};\n\n  function assignSecondArgument(arg) {\n    if (typeof arg === 'string') {\n      dstSelector = arg;\n    } else if (typeof arg === 'function') {\n      doneCallback = arg;\n    } else if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object') {\n      options = arg;\n    }\n  }\n\n  if (args.length === 3) {\n    options = args[2];\n    assignSecondArgument(args[1]);\n    selector = args[0];\n  } else if (args.length === 2) {\n    assignSecondArgument(args[1]);\n    selector = args[0];\n  } else if (args.length === 1) {\n    options = args[0];\n  }\n  if (selector) {\n    options.selector = selector;\n  }\n  if (doneCallback) {\n    options.done = doneCallback;\n  }\n  if (dstSelector) {\n    options.dstSelector = dstSelector;\n  }\n  return options;\n}\n\n// Public API:\nexports.default = {\n  snapshot: function snapshot() {\n    var options = parseSnapshotArguments(arguments);\n    var shutterbugWorker = new _shutterbugWorker2.default(options);\n    shutterbugWorker.getDomSnapshot();\n  },\n  enable: function enable(selector) {\n    this.disable();\n    selector = selector || 'body';\n    iframeWorker = new _shutterbugWorker2.default({ selector: selector });\n    iframeWorker.enableIframeCommunication();\n  },\n  disable: function disable() {\n    if (iframeWorker) {\n      iframeWorker.disableIframeCommunication();\n      iframeWorker = null;\n    }\n  },\n\n\n  // Supported events:\n  // 'saycheese' - triggered before snapshot is taken\n  // 'asyouwere' - triggered after snapshot is taken\n  on: function on(event, handler) {\n    (0, _jquery2.default)(window).on('shutterbug-' + event, handler);\n  },\n  off: function off(event, handler) {\n    (0, _jquery2.default)(window).off('shutterbug-' + event, handler);\n  }\n};\n\n//# sourceURL=webpack://Shutterbug/./js/index.js?");

/***/ }),

/***/ "./js/replace-blobs-with-data-urls.js":
/*!********************************************!*\
  !*** ./js/replace-blobs-with-data-urls.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = replaceBlobsWithDataURLs;\n\nvar _jquery = __webpack_require__(/*! jquery */ \"jquery\");\n\nvar _jquery2 = _interopRequireDefault(_jquery);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Downloads `blobURL` and provides object with mapping to dataURL format.\n// Async function, returns $.Deferred instance that will be resolved with the mapping.\nfunction convertBlobToDataURL(blobURL) {\n  var requestDeferred = new _jquery2.default.Deferred();\n  var xhr = new XMLHttpRequest();\n  xhr.onreadystatechange = function () {\n    if (this.readyState === 4 && this.status === 200) {\n      var reader = new FileReader();\n      reader.addEventListener('loadend', function () {\n        requestDeferred.resolve({ blobURL: blobURL, dataURL: reader.result });\n      });\n      reader.readAsDataURL(this.response);\n    }\n  };\n  xhr.open('GET', blobURL);\n  xhr.responseType = 'blob';\n  xhr.send();\n  return requestDeferred;\n}\n\n// Converts all the blob URLs (e.g. \"blob:http://examples.com/abc-def-ghi\") in `htmlString` to data URLs.\n// Async function, returns $.Deferred instance that will be resolved with the final HTML.\n/* eslint-env browser */\nfunction replaceBlobsWithDataURLs(htmlString) {\n  var deferred = new _jquery2.default.Deferred();\n  var blobURLs = htmlString.match(/[\"']blob:.*?[\"']/gi);\n  if (blobURLs === null) {\n    // Nothing to do.\n    deferred.resolve(htmlString);\n    return deferred;\n  }\n\n  var blobRequests = blobURLs\n  // .slice(1, -1) removes \" or ' from the URI.\n  .map(function (blobURLWithQuotes) {\n    return blobURLWithQuotes.slice(1, -1);\n  }).map(function (blobURL) {\n    return convertBlobToDataURL(blobURL);\n  });\n\n  _jquery2.default.when.apply(_jquery2.default, blobRequests).done(function () {\n    // Convert arguments to real Array instance.\n    var mappings = Array.prototype.slice.call(arguments);\n    var newHtmlString = htmlString;\n    mappings.forEach(function (mapping) {\n      newHtmlString = newHtmlString.replace(mapping.blobURL, mapping.dataURL);\n    });\n    deferred.resolve(newHtmlString);\n  });\n\n  return deferred;\n}\n\n//# sourceURL=webpack://Shutterbug/./js/replace-blobs-with-data-urls.js?");

/***/ }),

/***/ "./js/shutterbug-worker.js":
/*!*********************************!*\
  !*** ./js/shutterbug-worker.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _jquery = __webpack_require__(/*! jquery */ \"jquery\");\n\nvar _jquery2 = _interopRequireDefault(_jquery);\n\nvar _htmlTools = __webpack_require__(/*! ./html-tools */ \"./js/html-tools.js\");\n\nvar _replaceBlobsWithDataUrls = __webpack_require__(/*! ./replace-blobs-with-data-urls */ \"./js/replace-blobs-with-data-urls.js\");\n\nvar _replaceBlobsWithDataUrls2 = _interopRequireDefault(_replaceBlobsWithDataUrls);\n\nvar _defaultServer = __webpack_require__(/*! ./default-server */ \"./js/default-server.js\");\n\nvar _defaultServer2 = _interopRequireDefault(_defaultServer);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar MAX_TIMEOUT = 1500;\n\n// Each shutterbug instance on a single page requires unique ID (iframe-iframe communication).\nvar _id = 0;\n\nfunction getID() {\n  return _id++;\n}\n\nvar ShutterbugWorker = function () {\n  function ShutterbugWorker(options) {\n    _classCallCheck(this, ShutterbugWorker);\n\n    var opt = options || {};\n\n    if (!opt.selector) {\n      throw new Error('missing required option: selector');\n    }\n\n    // Remember that selector is anything accepted by jQuery, it can be DOM element too.\n    this.element = opt.selector;\n    this.callback = opt.done;\n    this.failCallback = opt.fail;\n    this.alwaysCallback = opt.always;\n    this.imgDst = opt.dstSelector;\n    this.server = opt.server || _defaultServer2.default;\n\n    this.id = getID();\n    this.iframeReqTimeout = MAX_TIMEOUT;\n\n    // Bind and save a new function, so it works well with .add/removeEventListener().\n    this._postMessageHandler = this._postMessageHandler.bind(this);\n  }\n\n  _createClass(ShutterbugWorker, [{\n    key: 'enableIframeCommunication',\n    value: function enableIframeCommunication() {\n      var _this = this;\n\n      (0, _jquery2.default)(document).ready(function () {\n        window.addEventListener('message', _this._postMessageHandler, false);\n      });\n    }\n  }, {\n    key: 'disableIframeCommunication',\n    value: function disableIframeCommunication() {\n      window.removeEventListener('message', this._postMessageHandler, false);\n    }\n  }, {\n    key: 'getDomSnapshot',\n    value: function getDomSnapshot() {\n      var _this2 = this;\n\n      this.enableIframeCommunication(); // !!!\n      var timerID = null;\n      if (this.imgDst) {\n        // Start timer and update destination element.\n        var time = 0;\n        var counter = (0, _jquery2.default)('<span>');\n        counter.html(time);\n        (0, _jquery2.default)(this.imgDst).html('Creating snapshot: ').append(counter);\n        timerID = setInterval(function () {\n          time = time + 1;\n          counter.html(time);\n        }, 1000);\n      }\n      // Ask for HTML fragment and render it on server.\n      this.getHtmlFragment(function (htmlData) {\n        _jquery2.default.ajax({\n          url: _this2.server + '/make-snapshot',\n          type: 'POST',\n          data: JSON.stringify(htmlData)\n        }).done(function (msg) {\n          if (_this2.callback) {\n            _this2.callback(msg.url);\n          }\n          if (_this2.imgDst) {\n            (0, _jquery2.default)(_this2.imgDst).html('<img src=' + msg.url + '>');\n          }\n        }).fail(function (jqXHR, textStatus, errorThrown) {\n          if (_this2.failCallback) {\n            _this2.failCallback(jqXHR, textStatus, errorThrown);\n          }\n          if (_this2.imgDst) {\n            (0, _jquery2.default)(_this2.imgDst).html('Snapshot failed');\n          }\n          console.error(textStatus, errorThrown);\n        }).always(function () {\n          clearInterval(timerID);\n          _this2.disableIframeCommunication(); // !!!\n          if (_this2.alwaysCallback) {\n            _this2.alwaysCallback();\n          }\n        });\n      });\n    }\n\n    // Most important method. Returns HTML, CSS and dimensions of the snapshot.\n\n  }, {\n    key: 'getHtmlFragment',\n    value: function getHtmlFragment(callback) {\n      var _this3 = this;\n\n      var $element = (0, _jquery2.default)(this.element);\n\n      // .find('iframe').addBack(\"iframe\") handles two cases:\n      // - element itself is an iframe - .addBack('iframe')\n      // - element descendants are iframes - .find('iframe')\n      var $iframes = $element.find('iframe').addBack('iframe');\n      this._iframeContentRequests = [];\n      $iframes.each(function (i, iframeElem) {\n        // Note that position of the iframe is used as its ID.\n        _this3._postHtmlFragRequestToIframe(iframeElem, i);\n      });\n\n      // Continue when we receive responses from all the nested iframes.\n      // Nested iframes descriptions will be provided as arguments.\n      _jquery2.default.when.apply(_jquery2.default, this._iframeContentRequests).done(function () {\n        $element.trigger('shutterbug-saycheese');\n\n        var clonedElement = $element.clone();\n\n        // remove all script elements from the clone we don't want the html fragment\n        // changing itself\n        clonedElement.find('script').remove();\n\n        // Nested iframes.\n        if (arguments.length > 0) {\n          var nestedIFrames = arguments;\n          // This supports two cases:\n          // - clonedElement itself is an iframe - .addBack('iframe')\n          // - clonedElement descendants are iframes - .find('iframe')\n          clonedElement.find('iframe').addBack('iframe').each(function (i, iframeElem) {\n            // When iframe doesn't support Shutterbug, request will timeout and null will be received.\n            // In such case just ignore this iframe, we won't be able to render it.\n            if (nestedIFrames[i] == null) return;\n            (0, _jquery2.default)(iframeElem).attr('srcdoc', (0, _htmlTools.generateFullHtmlFromFragment)(nestedIFrames[i]));\n          });\n        }\n\n        // Canvases.\n        // .addBack('canvas') handles case when the clonedElement itself is a canvas.\n        var replacementCanvasImgs = $element.find('canvas').addBack('canvas').map(function (i, elem) {\n          var dataUrl = (0, _htmlTools.getDataURL)(elem);\n          var img = (0, _htmlTools.cloneDomItem)((0, _jquery2.default)(elem), '<img>');\n          img.attr('src', dataUrl);\n          return img;\n        });\n\n        if (clonedElement.is('canvas')) {\n          clonedElement = replacementCanvasImgs[0];\n        } else {\n          clonedElement.find('canvas').each(function (i, elem) {\n            (0, _jquery2.default)(elem).replaceWith(replacementCanvasImgs[i]);\n          });\n        }\n\n        // Video elements.\n        // .addBack('video') handles case when the clonedElement itself is a video.\n        var replacementVideoImgs = [];\n        $element.find('video').addBack('video').map(function (i, elem) {\n          var $elem = (0, _jquery2.default)(elem);\n          var canvas = (0, _htmlTools.cloneDomItem)($elem, '<canvas>');\n          canvas[0].getContext('2d').drawImage(elem, 0, 0, $elem.width(), $elem.height());\n          try {\n            var dataUrl = (0, _htmlTools.getDataURL)(canvas[0]);\n            var img = (0, _htmlTools.cloneDomItem)($elem, '<img>');\n            img.attr('src', dataUrl);\n            replacementVideoImgs.push(img);\n          } catch (e) {\n            // If the video isn't hosted on the same site this will catch the security error\n            // and push null to signal it doesn't need replacing.  We don't use the return\n            // value of map() as returning null confuses jQuery.\n            replacementVideoImgs.push(null);\n          }\n        });\n\n        if (clonedElement.is('video')) {\n          if (replacementVideoImgs[0]) {\n            clonedElement = replacementVideoImgs[0];\n          }\n        } else {\n          clonedElement.find('video').each(function (i, elem) {\n            if (replacementVideoImgs[i]) {\n              (0, _jquery2.default)(elem).replaceWith(replacementVideoImgs[i]);\n            }\n          });\n        }\n\n        clonedElement.css({\n          // Make sure that clonedElement will be positioned in the top-left corner of the viewport.\n          'top': 0,\n          'left': 0,\n          'transform': 'translate3d(0, 0, 0)',\n          'margin': 0,\n          // Dimensions need to be set explicitly (e.g. otherwise 50% width wouldn't work as expected).\n          'width': $element.width(),\n          'height': $element.height()\n        });\n\n        var htmlString = (0, _jquery2.default)('<div>').append(clonedElement).html();\n        var cssString = (0, _jquery2.default)('<div>').append((0, _jquery2.default)('link[rel=\"stylesheet\"]').clone()).append((0, _jquery2.default)('style').clone()).html();\n        // Process HTML and CSS content when it's a string. Some operations are easier when we can use regular expressions\n        // instead of traversing the DOM using jQuery.\n        var htmlDeferred = (0, _replaceBlobsWithDataUrls2.default)(htmlString);\n        var cssDeferred = (0, _replaceBlobsWithDataUrls2.default)(cssString);\n        _jquery2.default.when(htmlDeferred, cssDeferred).done(function (processedHTMLString, processedCssString) {\n          var htmlData = {\n            content: processedHTMLString,\n            css: processedCssString,\n            width: $element.outerWidth(),\n            height: $element.outerHeight(),\n            base_url: window.location.href\n          };\n\n          $element.trigger('shutterbug-asyouwere');\n\n          callback(htmlData);\n        });\n      });\n    }\n\n    // frame-iframe communication related methods:\n\n    // Basic post message handler.\n\n  }, {\n    key: '_postMessageHandler',\n    value: function _postMessageHandler(message) {\n      function handleMessage(message, type, handler) {\n        var data = message.data;\n        if (typeof data === 'string') {\n          try {\n            data = JSON.parse(data);\n            if (data.type === type) {\n              handler(data, message.source);\n            }\n          } catch (e) {\n            // Not a json message. Ignore it. We only speak json.\n          }\n        }\n      }\n\n      handleMessage(message, 'htmlFragRequest', this._htmlFragRequestHandler.bind(this));\n      handleMessage(message, 'htmlFragResponse', this._htmlFragResponseHandler.bind(this));\n    }\n\n    // Iframe receives question about its content.\n\n  }, {\n    key: '_htmlFragRequestHandler',\n    value: function _htmlFragRequestHandler(data, source) {\n      // Update timeout. When we receive a request from parent, we have to finish nested iframes\n      // rendering in that time. Otherwise parent rendering will timeout.\n      // Backward compatibility: Shutterbug v0.1.x don't send iframeReqTimeout.\n      this.iframeReqTimeout = data.iframeReqTimeout != null ? data.iframeReqTimeout : MAX_TIMEOUT;\n      this.getHtmlFragment(function (html) {\n        var response = {\n          type: 'htmlFragResponse',\n          value: html,\n          iframeReqId: data.iframeReqId,\n          id: data.id // return to sender only\n        };\n        source.postMessage(JSON.stringify(response), '*');\n      });\n    }\n\n    // Parent receives content from iframes.\n\n  }, {\n    key: '_htmlFragResponseHandler',\n    value: function _htmlFragResponseHandler(data) {\n      if (data.id === this.id) {\n        // Backward compatibility: Shutterbug v0.1.x don't send iframeReqId.\n        var iframeReqId = data.iframeReqId != null ? data.iframeReqId : 0;\n        this._iframeContentRequests[iframeReqId].resolve(data.value);\n      }\n    }\n\n    // Parent asks iframes about their content.\n\n  }, {\n    key: '_postHtmlFragRequestToIframe',\n    value: function _postHtmlFragRequestToIframe(iframeElem, iframeId) {\n      var message = {\n        type: 'htmlFragRequest',\n        id: this.id,\n        iframeReqId: iframeId,\n        // We have to provide smaller timeout while sending message to nested iframes.\n        // Otherwise, when one of the nested iframes timeouts, then all will do the\n        // same and we won't render anything - even iframes that support Shutterbug.\n        iframeReqTimeout: this.iframeReqTimeout * 0.6\n      };\n      iframeElem.contentWindow.postMessage(JSON.stringify(message), '*');\n      var requestDeferred = new _jquery2.default.Deferred();\n      this._iframeContentRequests[iframeId] = requestDeferred;\n      setTimeout(function () {\n        // It handles a situation in which iframe doesn't support Shutterbug.\n        // When we doesn't receive answer for some time, assume that we can't\n        // render this particular iframe (provide null as iframe description).\n        if (requestDeferred.state() !== 'resolved') {\n          requestDeferred.resolve(null);\n        }\n      }, this.iframeReqTimeout);\n    }\n  }]);\n\n  return ShutterbugWorker;\n}();\n\nexports.default = ShutterbugWorker;\n\n//# sourceURL=webpack://Shutterbug/./js/shutterbug-worker.js?");

/***/ }),

/***/ "jquery":
/*!******************************************************************************************!*\
  !*** external {"root":"jQuery","commonjs2":"jquery","commonjs":"jquery","amd":"jquery"} ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_jquery__;\n\n//# sourceURL=webpack://Shutterbug/external_%7B%22root%22:%22jQuery%22,%22commonjs2%22:%22jquery%22,%22commonjs%22:%22jquery%22,%22amd%22:%22jquery%22%7D?");

/***/ })

/******/ })["default"];
});