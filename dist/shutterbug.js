(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("scripts/default-server", function(exports, require, module) {
// Default Shutterbug server that is used by JS library.
module.exports = "//snapshot.concord.org/shutterbug";
// Note that when you work on the server-side features, you can change this
// path to localhost and all the demo pages will automatically use your local
// server, as they don't specify server explicitly. Just uncomment this line:
// module.exports = "//localhost:9292/shutterbug";

});

require.register("scripts/html-tools", function(exports, require, module) {
var $ = jQuery;

module.exports = {
  cloneDomItem: function($elem, elemTag) {
    var $returnElm = $(elemTag);
    $returnElm.addClass($elem.attr('class'));
    $returnElm.attr('style', $elem.attr('style'));
    $returnElm.css('background', $elem.css('background'));
    $returnElm.attr('width', $elem.width());
    $returnElm.attr('height', $elem.height());
    return $returnElm;
  },

  generateFullHtmlFromFragment: function(fragment) {
    return "<!DOCTYPE html>" +
      "<html>" +
        "<head>" +
          "<base href='" + fragment.base_url + "'>" +
          "<meta content='text/html;charset=utf-8' http-equiv='Content-Type'>" +
          "<title>content from " + fragment.base_url + "</title>" +
          fragment.css +
        "</head>" +
        "<body>" +
          fragment.content +
        "</body>" +
      "</html>";
  },

  dataURLtoBlob: function(dataURL) {
    // Convert base64/URLEncoded data component to raw binary data held in a string.
    if (dataURL.split(',')[0].indexOf('base64') === -1) {
      throw new Error('expected base64 data');
    }
    var byteString = atob(dataURL.split(',')[1]);
    // Separate out the mime component.
    var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    // Write the bytes of the string to a typed array.
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }
};

});

require.register("scripts/shutterbug-worker", function(exports, require, module) {
var $ = jQuery;
var htmlTools      = require('scripts/html-tools');
var DEFAULT_SERVER = require('scripts/default-server');

var MAX_TIMEOUT = 1500;
var BIN_DATA_SUPPORTED = typeof(window.Blob) === 'function' &&
                         typeof(window.Uint8Array) === 'function'; // IE9

// Each shutterbug instance on a single page requires unique ID (iframe-iframe communication).
var _id = 0;
function getID() {
  return _id++;
}

function ShutterbugWorker(options) {
  var opt = options || {};

  if (!opt.selector) {
    throw new Error("missing required option: selector");
  }

  this.element            = opt.selector;
  this.callback           = opt.done;
  this.failCallback       = opt.fail;
  this.alwaysCallback     = opt.always;
  this.imgDst             = opt.dstSelector;
  this.server             = opt.server  || DEFAULT_SERVER;
  this.imageFormat        = opt.format  || 'png';
  this.imageQuality       = opt.quality || 1;
  this._useIframeSizeHack = opt.useIframeSizeHack;

  this.id = getID();
  this.iframeReqTimeout = MAX_TIMEOUT;

  // Bind and save a new function, so it works well with .add/removeEventListener().
  this._postMessageHandler = this._postMessageHandler.bind(this);
};

ShutterbugWorker.prototype.enableIframeCommunication = function() {
  $(document).ready(function() {
    window.addEventListener('message', this._postMessageHandler, false);
  }.bind(this));
};

ShutterbugWorker.prototype.disableIframeCommunication = function() {
  window.removeEventListener('message', this._postMessageHandler, false);
};

ShutterbugWorker.prototype.getHtmlFragment = function(callback) {
  var self = this;
  var $element = $(this.element);
  // .find('iframe').addBack("iframe") handles two cases:
  // - element itself is an iframe - .addBack('iframe')
  // - element descentands are iframes - .find('iframe')
  var $iframes = $element.find('iframe').addBack("iframe");

  this._iframeContentRequests = [];
  $iframes.each(function(i, iframeElem) {
    // Note that position of the iframe is used as its ID.
    self._postHtmlFragRequestToIframe(iframeElem, i);
  });

  // Continue when we receive responses from all the nested iframes.
  // Nested iframes descriptions will be provided as arguments.
  $.when.apply($, this._iframeContentRequests).done(function() {

    $element.trigger('shutterbug-saycheese');

    var css     = $('<div>').append($('link[rel="stylesheet"]').clone()).append($('style').clone()).html();
    var width   = $element.width();
    var height  = $element.height();
    var element = $element.clone();

    // remove all script elements from the clone we don't want the html fragement
    // changing itself
    element.find("script").remove();

    if (arguments.length > 0) {
      var nestedIFrames = arguments;
      // This supports two cases:
      // - element itself is an iframe - .addBack('iframe')
      // - element descentands are iframes - .find('iframe')
      element.find("iframe").addBack("iframe").each(function(i, iframeElem) {
        // When iframe doesn't support Shutterbug, request will timeout and null will be received.
        // In such case just ignore this iframe, we won't be able to render it.
        if (nestedIFrames[i] == null) return;
        $(iframeElem).attr("src", "data:text/html," + htmlTools.generateFullHtmlFromFragment(nestedIFrames[i]));
      });
    }

    // .addBack('canvas') handles case when the element itself is a canvas.
    var replacementImgs = $element.find('canvas').addBack('canvas').map(function(i, elem) {
        // Use png here, as it supports transparency and canvas can be layered on top of other elements.
        var dataUrl = elem.toDataURL('image/png');
        var img = htmlTools.cloneDomItem($(elem), "<img>");
        img.attr('src', dataUrl);
        return img;
    });

    if (element.is('canvas')) {
      element = replacementImgs[0];
    } else {
      element.find('canvas').each(function(i, elem) {
        $(elem).replaceWith(replacementImgs[i]);
      });
    }

    element.css({
      'top': 0,
      'left': 0,
      'margin': 0,
      'width': width,
      'height': height
    });

    // Due to a weird layout bug in PhantomJS, inner iframes sometimes don't render
    // unless we set the width small. This doesn't affect the actual output at all.
    if (self._useIframeSizeHack) {
      width = 10;
    }

    var html_content = {
      content: $('<div>').append(element).html(),
      css: css,
      width: width,
      height: height,
      base_url: window.location.href
    };

    $element.trigger('shutterbug-asyouwere');

    callback(html_content);
  });
};

ShutterbugWorker.prototype.getDomSnapshot = function() {
  this.enableIframeCommunication(); // !!!
  // Start timer.
  var self = this;
  var time = 0;
  var counter = $("<span>");
  counter.html(time);
  $(self.imgDst).html("creating snapshot: ").append(counter);
  this.timer = setInterval(function(t) {
    time = time + 1;
    counter.html(time);
  }, 1000);
  var tagName = $(this.element).prop("tagName");
  switch(tagName) {
    case "CANVAS":
      this.canvasSnapshot();
      break;
    default:
      this.basicSnapshot();
      break;
  }
};

ShutterbugWorker.prototype.canvasSnapshot = function() {
  if (!BIN_DATA_SUPPORTED) {
    return this.basicSnapshot();
  }
  var self = this;
  $.ajax({
    type: 'GET',
    url: this.server + '/img_upload_url?format=' + this.imageFormat
  }).done(function(data) {
    self.directUpload(data);
  }).fail(function() {
    // Use basic snapshot as a fallback.
    // Direct upload is not supported on server side (e.g. due to used storage).
    self.basicSnapshot();
  });
};

ShutterbugWorker.prototype.directUpload = function(options) {
  var $canvas = $(this.element);
  var dataURL = $canvas[0].toDataURL('image/' + this.imageFormat, this.imageQuality)
  var blob = htmlTools.dataURLtoBlob(dataURL);
  var self = this;
  $.ajax({
    type: 'PUT',
    url: options.put_url,
    data: blob,
    processData: false,
    contentType: false
  }).done(function(data) {
    self._successHandler("<img src='" + options.get_url + "'>");
  }).fail(function(jqXHR, textStatus, errorThrown) {
    self._failHandler(jqXHR, textStatus, errorThrown)
  }).always(function() {
    self._alwaysHandler();
  });
}

ShutterbugWorker.prototype.basicSnapshot = function() {
  var self = this;
  // Ask for HTML fragment and render it on server.
  this.getHtmlFragment(function(html_data) {
    html_data.format = self.imageFormat;
    html_data.quality = self.imageQuality;
    $.ajax({
      url: self.server + '/make_snapshot',
      type: 'POST',
      data: html_data
    }).done(function(msg) {
      self._successHandler(msg)
    }).fail(function(jqXHR, textStatus, errorThrown) {
      self._failHandler(jqXHR, textStatus, errorThrown);
    }).always(function() {
      self._alwaysHandler();
    });
  });
};

ShutterbugWorker.prototype._successHandler = function(imageTag) {
  if (this.imgDst) {
    $(this.imgDst).html(imageTag);
  }
  if (this.callback) {
    // Extract the url out of the returned html fragment.
    var imgUrl = imageTag.match(/src=['"]([^'"]*)['"]/)[1];
    this.callback(imgUrl);
  }
};

ShutterbugWorker.prototype._failHandler = function(jqXHR, textStatus, errorThrown) {
  if (this.imgDst) {
    $(this.imgDst).html("snapshot failed");
  }
  if (this.failCallback) {
    this.failCallback(jqXHR, textStatus, errorThrown);
  }
}

ShutterbugWorker.prototype._alwaysHandler = function() {
  clearInterval(this.timer);
  this.disableIframeCommunication(); // !!!
  if (this.alwaysCallback) {
    this.alwaysCallback();
  }
};

ShutterbugWorker.prototype.htmlSnap = function() {
  this.getHtmlFragment(function callback(fragment) {
    // FIXME btoa is not intended to encode text it is for for 8bit per char strings
    // so if you send it a UTF8 string with a special char in it, it will fail
    // this SO has a note about handling this:
    // http://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
    // also note that btoa is only available in IE10+
    var encodedContent = btoa(htmlTools.generateFullHtmlFromFragment(fragment));
    window.open("data:text/html;base64," + encodedContent);
  });
};

ShutterbugWorker.prototype.imageSnap = function() {
  var oldImgDst = this.imgDst,
      oldCallback = this.callback,
      self = this;
  this.imgDst = null;
  this.callback = function (imgUrl) {
    window.open(imgUrl);
    self.imgDst = oldImgDst;
    self.callback = oldCallback;
  }
  this.getDomSnapshot();
};

// ### Iframe-iframe communication related methods ###

// Basic post message handler.
ShutterbugWorker.prototype._postMessageHandler = function(message) {
  function handleMessage(message, type, handler) {
    var data = message.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        if (data.type === type) {
          handler(data, message.source);
        }
      } catch(e) {
        // Not a json message. Ignore it. We only speak json.
      }
    }
  }
  handleMessage(message, 'htmlFragRequest', this._htmlFragRequestHandler.bind(this));
  handleMessage(message, 'htmlFragResponse', this._htmlFragResponseHandler.bind(this));
};

// Iframe receives question about its content.
ShutterbugWorker.prototype._htmlFragRequestHandler = function(data, source) {
  // Update timeout. When we receive a request from parent, we have to finish nested iframes
  // rendering in that time. Otherwise parent rendering will timeout.
  // Backward compatibility: Shutterbug v0.1.x don't send iframeReqTimeout.
  this.iframeReqTimeout = data.iframeReqTimeout != null ? data.iframeReqTimeout : MAX_TIMEOUT;
  this.getHtmlFragment(function(html) {
    var response = {
      type:        'htmlFragResponse',
      value:       html,
      iframeReqId: data.iframeReqId,
      id:          data.id // return to sender only
    };
    source.postMessage(JSON.stringify(response), "*");
  });
};

// Parent receives content from iframes.
ShutterbugWorker.prototype._htmlFragResponseHandler = function(data) {
  if (data.id === this.id) {
    // Backward compatibility: Shutterbug v0.1.x don't send iframeReqId.
    var iframeReqId = data.iframeReqId != null ? data.iframeReqId : 0;
    this._iframeContentRequests[iframeReqId].resolve(data.value);
  }
};

// Parent asks iframes about their content.
ShutterbugWorker.prototype._postHtmlFragRequestToIframe = function(iframeElem, iframeId) {
  var message  = {
    type:        'htmlFragRequest',
    id:          this.id,
    iframeReqId: iframeId,
    // We have to provide smaller timeout while sending message to nested iframes.
    // Otherwise, when one of the nested iframes timeouts, then all will do the
    // same and we won't render anything - even iframes that support Shutterbug.
    iframeReqTimeout: this.iframeReqTimeout * 0.6
  };
  iframeElem.contentWindow.postMessage(JSON.stringify(message), "*");
  var requestDeffered = new $.Deferred();
  this._iframeContentRequests[iframeId] = requestDeffered;
  setTimeout(function() {
    // It handles a situation in which iframe doesn't support Shutterbug.
    // When we doesn't receive answer for some time, assume that we can't
    // render this particular iframe (provide null as iframe description).
    if (requestDeffered.state() !== "resolved") {
      requestDeffered.resolve(null);
    }
  }, this.iframeReqTimeout);
};

// ###

module.exports = ShutterbugWorker;

});

require.register("scripts/shutterbug", function(exports, require, module) {
var ShutterbugWorker = require('scripts/shutterbug-worker');

function parseSnapshotArguments(arguments) {
  var selector;
  var doneCallback;
  var dstSelector;
  var options = {};
  function assignSecondArgument(arg) {
    if (typeof arg === 'string')        { dstSelector  = arg; }
    else if (typeof arg === 'function') { doneCallback = arg; }
    else if (typeof arg === 'object')   { options      = arg; }
  }
  if (arguments.length === 3) {
    options = arguments[2];
    assignSecondArgument(arguments[1]);
    selector = arguments[0];
  } else if (arguments.length === 2) {
    assignSecondArgument(arguments[1]);
    selector = arguments[0];
  } else if (arguments.length === 1) {
    options = arguments[0];
  }
  if (selector)     { options.selector    = selector; }
  if (doneCallback) { options.done        = doneCallback; }
  if (dstSelector)  { options.dstSelector = dstSelector; }
  return options;
}

module.exports = {
  snapshot: function() {
    var options = parseSnapshotArguments(arguments);
    var worker = new ShutterbugWorker(options);
    worker.getDomSnapshot();
  },

  enable: function(selector) {
    this.disable();
    selector = selector || 'body';
    this._iframeWorker = new ShutterbugWorker({selector: selector});
    this._iframeWorker.enableIframeCommunication();
  },

  disable: function() {
    if (this._iframeWorker) {
      this._iframeWorker.disableIframeCommunication();
    }
  }
};

});

// Do not force users to call require() manually, export Shutterbug constructor.
// See: https://github.com/brunch/brunch/issues/712
window.Shutterbug = require('scripts/shutterbug');

