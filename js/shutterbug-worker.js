import $ from 'jquery'
import { generateFullHtmlFromFragment, cloneDomItem } from './html-tools'
import DEFAULT_SERVER from './default-server'

const MAX_TIMEOUT = 1500

// Each shutterbug instance on a single page requires unique ID (iframe-iframe communication).
let _id = 0

function getID () {
  return _id++
}

export default class ShutterbugWorker {
  constructor (options) {
    const opt = options || {}

    if (!opt.selector) {
      throw new Error('missing required option: selector')
    }

    // Remember that selector is anything accepted by jQuery, it can be DOM element too.
    this.element = opt.selector
    this.callback = opt.done
    this.failCallback = opt.fail
    this.alwaysCallback = opt.always
    this.imgDst = opt.dstSelector
    this.server = opt.server || DEFAULT_SERVER

    this.id = getID()
    this.iframeReqTimeout = MAX_TIMEOUT

    // Bind and save a new function, so it works well with .add/removeEventListener().
    this._postMessageHandler = this._postMessageHandler.bind(this)
  }

  enableIframeCommunication () {
    $(document).ready(() => {
      window.addEventListener('message', this._postMessageHandler, false)
    })
  }

  disableIframeCommunication () {
    window.removeEventListener('message', this._postMessageHandler, false)
  }

  getDomSnapshot () {
    this.enableIframeCommunication() // !!!
    let timerID = null
    if (this.imgDst) {
      // Start timer and update destination element.
      let time = 0
      const counter = $('<span>')
      counter.html(time)
      $(this.imgDst).html('Creating snapshot: ').append(counter)
      timerID = setInterval(() => {
        time = time + 1
        counter.html(time)
      }, 1000)
    }
    // Ask for HTML fragment and render it on server.
    this.getHtmlFragment((htmlData) => {
      $.ajax({
        url: this.server + '/make-snapshot',
        type: 'POST',
        data: JSON.stringify(htmlData)
      }).done(msg => {
        if (this.callback) {
          this.callback(msg.url)
        }
        if (this.imgDst) {
          $(this.imgDst).html(`<img src=${msg.url}>`);
        }
      }).fail((jqXHR, textStatus, errorThrown) => {
        if (this.failCallback) {
          this.failCallback(jqXHR, textStatus, errorThrown)
        }
        if (this.imgDst) {
          $(this.imgDst).html(`Snapshot failed`);
        }
        console.error(textStatus, errorThrown)
      }).always(() => {
        clearInterval(timerID)
        this.disableIframeCommunication() // !!!
        if (this.alwaysCallback) {
          this.alwaysCallback()
        }
      })
    })
  }

  // Most important method. Returns HTML, CSS and dimensions of the snapshot.
  getHtmlFragment (callback) {
    const $element = $(this.element)

    // .find('iframe').addBack("iframe") handles two cases:
    // - element itself is an iframe - .addBack('iframe')
    // - element descendants are iframes - .find('iframe')
    const $iframes = $element.find('iframe').addBack('iframe')
    this._iframeContentRequests = []
    $iframes.each((i, iframeElem) => {
      // Note that position of the iframe is used as its ID.
      this._postHtmlFragRequestToIframe(iframeElem, i)
    })

    // Continue when we receive responses from all the nested iframes.
    // Nested iframes descriptions will be provided as arguments.
    $.when.apply($, this._iframeContentRequests).done(function () {
      $element.trigger('shutterbug-saycheese')

      let clonedElement = $element.clone()

      // remove all script elements from the clone we don't want the html fragment
      // changing itself
      clonedElement.find('script').remove()

      // Nested iframes.
      if (arguments.length > 0) {
        const nestedIFrames = arguments
        // This supports two cases:
        // - clonedElement itself is an iframe - .addBack('iframe')
        // - clonedElement descendants are iframes - .find('iframe')
        clonedElement.find('iframe').addBack('iframe').each(function (i, iframeElem) {
          // When iframe doesn't support Shutterbug, request will timeout and null will be received.
          // In such case just ignore this iframe, we won't be able to render it.
          if (nestedIFrames[i] == null) return
          $(iframeElem).attr('src', 'data:text/html,' + generateFullHtmlFromFragment(nestedIFrames[i]))
        })
      }

      // Canvases.
      // .addBack('canvas') handles case when the clonedElement itself is a canvas.
      const replacementCanvasImgs = $element.find('canvas').addBack('canvas').map(function (i, elem) {
        // Use png here, as it supports transparency and canvas can be layered on top of other elements.
        const dataUrl = elem.toDataURL('image/png')
        const img = cloneDomItem($(elem), '<img>')
        img.attr('src', dataUrl)
        return img
      })

      if (clonedElement.is('canvas')) {
        clonedElement = replacementCanvasImgs[0]
      } else {
        clonedElement.find('canvas').each((i, elem) => {
          $(elem).replaceWith(replacementCanvasImgs[i])
        })
      }

      // Video elements.
      // .addBack('video') handles case when the clonedElement itself is a video.
      const replacementVideoImgs = []
      $element.find('video').addBack('video').map((i, elem) => {
        const $elem = $(elem)
        const canvas = cloneDomItem($elem, '<canvas>')
        canvas[0].getContext('2d').drawImage(elem, 0, 0, $elem.width(), $elem.height())
        try {
          const dataUrl = canvas[0].toDataURL('image/png')
          const img = cloneDomItem($elem, '<img>')
          img.attr('src', dataUrl)
          replacementVideoImgs.push(img)
        } catch (e) {
          // If the video isn't hosted on the same site this will catch the security error
          // and push null to signal it doesn't need replacing.  We don't use the return
          // value of map() as returning null confuses jQuery.
          replacementVideoImgs.push(null)
        }
      })

      if (clonedElement.is('video')) {
        if (replacementVideoImgs[0]) {
          clonedElement = replacementVideoImgs[0]
        }
      } else {
        clonedElement.find('video').each(function (i, elem) {
          if (replacementVideoImgs[i]) {
            $(elem).replaceWith(replacementVideoImgs[i])
          }
        })
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
      })

      const htmlData = {
        content: $('<div>').append(clonedElement).html(),
        css: $('<div>').append($('link[rel="stylesheet"]').clone()).append($('style').clone()).html(),
        width: $element.outerWidth(),
        height: $element.outerHeight(),
        base_url: window.location.href
      }

      $element.trigger('shutterbug-asyouwere')

      callback(htmlData)
    })
  }

  // frame-iframe communication related methods:

  // Basic post message handler.
  _postMessageHandler (message) {
    function handleMessage (message, type, handler) {
      let data = message.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
          if (data.type === type) {
            handler(data, message.source)
          }
        } catch (e) {
          // Not a json message. Ignore it. We only speak json.
        }
      }
    }

    handleMessage(message, 'htmlFragRequest', this._htmlFragRequestHandler.bind(this))
    handleMessage(message, 'htmlFragResponse', this._htmlFragResponseHandler.bind(this))
  }

  // Iframe receives question about its content.
  _htmlFragRequestHandler (data, source) {
    // Update timeout. When we receive a request from parent, we have to finish nested iframes
    // rendering in that time. Otherwise parent rendering will timeout.
    // Backward compatibility: Shutterbug v0.1.x don't send iframeReqTimeout.
    this.iframeReqTimeout = data.iframeReqTimeout != null ? data.iframeReqTimeout : MAX_TIMEOUT
    this.getHtmlFragment(function (html) {
      const response = {
        type: 'htmlFragResponse',
        value: html,
        iframeReqId: data.iframeReqId,
        id: data.id // return to sender only
      }
      source.postMessage(JSON.stringify(response), '*')
    })
  }

  // Parent receives content from iframes.
  _htmlFragResponseHandler (data) {
    if (data.id === this.id) {
      // Backward compatibility: Shutterbug v0.1.x don't send iframeReqId.
      const iframeReqId = data.iframeReqId != null ? data.iframeReqId : 0
      this._iframeContentRequests[iframeReqId].resolve(data.value)
    }
  }

  // Parent asks iframes about their content.
  _postHtmlFragRequestToIframe (iframeElem, iframeId) {
    const message = {
      type: 'htmlFragRequest',
      id: this.id,
      iframeReqId: iframeId,
      // We have to provide smaller timeout while sending message to nested iframes.
      // Otherwise, when one of the nested iframes timeouts, then all will do the
      // same and we won't render anything - even iframes that support Shutterbug.
      iframeReqTimeout: this.iframeReqTimeout * 0.6
    }
    iframeElem.contentWindow.postMessage(JSON.stringify(message), '*')
    const requestDeferred = new $.Deferred()
    this._iframeContentRequests[iframeId] = requestDeferred
    setTimeout(function () {
      // It handles a situation in which iframe doesn't support Shutterbug.
      // When we doesn't receive answer for some time, assume that we can't
      // render this particular iframe (provide null as iframe description).
      if (requestDeferred.state() !== 'resolved') {
        requestDeferred.resolve(null)
      }
    }, this.iframeReqTimeout)
  }
}
