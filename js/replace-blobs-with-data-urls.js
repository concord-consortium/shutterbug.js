/* eslint-env browser */
import $ from 'jquery'

// Downloads `blobURL` and provides object with mapping to dataURL format.
// Async function, returns $.Deferred instance that will be resolved with the mapping.
function convertBlobToDataURL (blobURL) {
  const requestDeferred = new $.Deferred()
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const reader = new FileReader()
      reader.addEventListener('loadend', function () {
        requestDeferred.resolve({blobURL, dataURL: reader.result})
      })
      reader.readAsDataURL(this.response)
    }
  }
  xhr.open('GET', blobURL)
  xhr.responseType = 'blob'
  xhr.send()
  return requestDeferred
}

// Converts all the blob URLs (e.g. "blob:http://examples.com/abc-def-ghi") in `htmlString` to data URLs.
// Async function, returns $.Deferred instance that will be resolved with the final HTML.
export default function replaceBlobsWithDataURLs (htmlString) {
  const deferred = new $.Deferred()
  const blobURLs = htmlString.match(/["']blob:.*?["']/gi)
  if (blobURLs === null) {
    // Nothing to do.
    deferred.resolve(htmlString)
    return deferred
  }

  const blobRequests = blobURLs
    // .slice(1, -1) removes " or ' from the URI.
    .map(blobURLWithQuotes => blobURLWithQuotes.slice(1, -1))
    .map(blobURL => convertBlobToDataURL(blobURL))

  $.when.apply($, blobRequests).done(function () {
    // Convert arguments to real Array instance.
    const mappings = Array.prototype.slice.call(arguments)
    let newHtmlString = htmlString
    mappings.forEach(mapping => {
      newHtmlString = newHtmlString.replace(mapping.blobURL, mapping.dataURL)
    })
    deferred.resolve(newHtmlString)
  })

  return deferred
}
