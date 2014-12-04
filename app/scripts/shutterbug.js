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
    selector = selector || 'body';
    var worker = new ShutterbugWorker({selector: selector});
    worker.enableIframeCommunication();
  }
};
