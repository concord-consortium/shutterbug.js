import $ from 'jquery'

export function cloneDomItem ($elem, elemTag) {
  const $returnElm = $(elemTag)
  $returnElm.addClass($elem.attr('class'))
  $returnElm.attr('id', $elem.attr('id'))
  $returnElm.attr('style', $elem.attr('style'))
  $returnElm.css('background', $elem.css('background'))
  $returnElm.attr('width', $elem.width())
  $returnElm.attr('height', $elem.height())
  return $returnElm
}

// element should be an instance of Canvas or Video element (element supported as an input to Canvas.drawImage method).
// In some cases dataURL should be rescaled down to real size of the element (high DPI displays).
// It doesn't make sense to send original data, as it might be really large and cause issues while rendering page on
// AWS Lambda.
export function getDataURL (element) {
  // Always use png to support transparent background.
  const format = 'image/png'
  const realWidth = $(element).width()
  const realHeight = $(element).height()
  const widthAttr = Number($(element).attr('width')) || realWidth
  const heightAttr = Number($(element).attr('height')) || realHeight
  if (realWidth === widthAttr && realHeight === heightAttr) {
    return element.toDataURL(format)
  }
  // Scale down image to its real size.
  const canvas = document.createElement('canvas')
  canvas.width = realWidth
  canvas.height = realHeight
  const ctx = canvas.getContext('2d')
  // Other canvas or video element can be used as a source in .drawImage.
  ctx.drawImage(element, 0, 0, realWidth, realHeight)
  return canvas.toDataURL(format)
}

export function generateFullHtmlFromFragment (fragment) {
  return `
    <!DOCTYPE html> 
    <html> 
    <head> 
      <base href="${fragment.base_url}"> 
      <meta content="text/html;charset=utf-8" http-equiv="Content-Type"> 
      <title>content from ${fragment.base_url}</title> 
      ${fragment.css} 
    </head> 
      <body> 
        ${fragment.content} 
      </body> 
    </html>
   `
}
