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

// TODO: Construct using opts instead of positional arguments.
function Shutterbug(options) {
  var opt = options || {};

  if (!opt.selector || (!opt.callback && !opt.dstSelector)) {
    // Nothing to do, we need at least selector and either callback or destSelector.
    return;
  }

  this.element      = opt.selector;
  this.callback     = opt.callback;
  this.imgDst       = opt.dstSelector;
  this.server       = opt.server || DEFAULT_SERVER;
  this.imageFormat  = opt.format || 'png';
  this.imageQuality = opt.quality || 1;

  this.id = getID();
  this.iframeReqTimeout = MAX_TIMEOUT;

  $(document).ready(function () {
    window.addEventListener('message', this._postMessageHandler.bind(this), false);
  }.bind(this));
};

Shutterbug.prototype.getHtmlFragment = function(callback) {
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
      'height' :height
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

Shutterbug.prototype.getDomSnapshot = function() {
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

Shutterbug.prototype.canvasSnapshot = function() {
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

Shutterbug.prototype.directUpload = function(options) {
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
    self.success('<img src=' + options.get_url + '>');
  }).fail(function(jqXHR, textStatus, errorThrown) {
    self.fail(jqXHR, textStatus, errorThrown)
  });
}

Shutterbug.prototype.basicSnapshot = function() {
  var self = this;
  // Ask for HTML fragment and render it on server.
  this.getHtmlFragment(function(html_data) {
    html_data.format = self.imageFormat;
    html_data.quality = self.imageQuality;
    $.ajax({
      url: self.server + '/make_snapshot',
      type: 'POST',
      data: html_data
    }).success(function(msg) {
      self.success(msg)
    }).fail(function(jqXHR, textStatus, errorThrown) {
      self.fail(jqXHR, textStatus, errorThrown);
    });
  });
};

Shutterbug.prototype.success = function(imageTag) {
  if (this.imgDst) {
    $(this.imgDst).html(imageTag);
  }
  if (this.callback) {
    this.callback(msg);
  }
  clearInterval(this.timer);
};

Shutterbug.prototype.fail = function(jqXHR, textStatus, errorThrown) {
  if (this.imgDst) {
    $(this.imgDst).html("snapshot failed");
  }
  if (this.failCallback) {
    this.failCallback(jqXHR, textStatus, errorThrown);
  }
  clearInterval(this.timer);
}

Shutterbug.prototype.requestHtmlFrag = function() {
  var destination = $(this.element)[0].contentWindow;
  var message  = {
    type: 'htmlFragRequest',
    id: this.id
  };
  destination.postMessage(JSON.stringify(message), "*");
};

Shutterbug.prototype.htmlSnap = function() {
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

Shutterbug.prototype.imageSnap = function() {
  var oldImgDst = this.imgDst,
      oldCallback = this.callback,
      self = this;
  this.imgDst = null;
  this.callback = function (msg){
    // extract the url out of the returned html fragment
    var imgUrl = msg.match(/src='([^']*)'/)[1]
    window.open(imgUrl);
    self.imgDst = oldImgDst;
    self.callback = oldCallback;
  }
  this.getDomSnapshot();
};

Shutterbug.prototype.setFailureCallback = function(failCallback) {
  this.failCallback = failCallback;
};

Shutterbug.prototype.useIframeSizeHack = function(b) {
  this._useIframeSizeHack = b;
};

// ### Iframe-iframe communication related methods ###

Shutterbug.prototype._postMessageHandler = function(message) {
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
Shutterbug.prototype._htmlFragRequestHandler = function(data, source) {
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
Shutterbug.prototype._htmlFragResponseHandler = function(data) {
  if (data.id === this.id) {
    // Backward compatibility: Shutterbug v0.1.x don't send iframeReqId.
    var iframeReqId = data.iframeReqId != null ? data.iframeReqId : 0;
    this._iframeContentRequests[iframeReqId].resolve(data.value);
  }
};

// Parent asks iframes about their content.
Shutterbug.prototype._postHtmlFragRequestToIframe = function(iframeElem, iframeId) {
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

module.exports = Shutterbug;
