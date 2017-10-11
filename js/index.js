import $ from 'jquery'
import ShutterbugWorker from './shutterbug-worker'

// Used by enable and disable functions.
let iframeWorker = null

function parseSnapshotArguments (args) {
  // Remember that selector is anything accepted by jQuery, it can be DOM element too.
  let selector
  let doneCallback
  let dstSelector
  let options = {}

  function assignSecondArgument (arg) {
    if (typeof arg === 'string') { dstSelector = arg } else if (typeof arg === 'function') { doneCallback = arg } else if (typeof arg === 'object') { options = arg }
  }

  if (args.length === 3) {
    options = args[2]
    assignSecondArgument(args[1])
    selector = args[0]
  } else if (args.length === 2) {
    assignSecondArgument(args[1])
    selector = args[0]
  } else if (args.length === 1) {
    options = args[0]
  }
  if (selector) { options.selector = selector }
  if (doneCallback) { options.done = doneCallback }
  if (dstSelector) { options.dstSelector = dstSelector }
  return options
}

// Public API:
export default {
  snapshot () {
    const options = parseSnapshotArguments(arguments)
    const shutterbugWorker = new ShutterbugWorker(options)
    shutterbugWorker.getDomSnapshot()
  },

  enable (selector) {
    this.disable()
    selector = selector || 'body'
    iframeWorker = new ShutterbugWorker({selector: selector})
    iframeWorker.enableIframeCommunication()
  },

  disable () {
    if (iframeWorker) {
      iframeWorker.disableIframeCommunication()
      iframeWorker = null
    }
  },

  // Supported events:
  // 'saycheese' - triggered before snapshot is taken
  // 'asyouwere' - triggered after snapshot is taken
  on (event, handler) {
    $(window).on('shutterbug-' + event, handler)
  },

  off (event, handler) {
    $(window).off('shutterbug-' + event, handler)
  }
}
