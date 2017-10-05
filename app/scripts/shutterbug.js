var $ = typeof jQuery !== 'undefined' ? jQuery : require('jquery');
var ShutterbugWorker = require('./shutterbug-worker');

function parseSnapshotArguments(args) {
  // Remember that selector is anything accepted by jQuery, it can be DOM element too.
  var selector;
  var doneCallback;
  var dstSelector;
  var options = {};
  function assignSecondArgument(arg) {
    if (typeof arg === 'string')        { dstSelector  = arg; }
    else if (typeof arg === 'function') { doneCallback = arg; }
    else if (typeof arg === 'object')   { options      = arg; }
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
  },

  // Supported events:
  // 'saycheese' - triggered before snapshot is taken
  // 'asyouwere' - triggered after snapshot is taken
  on: function(event, handler) {
    $(window).on('shutterbug-' + event, handler)
  },

  off: function(event, handler) {
    $(window).off('shutterbug-' + event, handler)
  }
};
