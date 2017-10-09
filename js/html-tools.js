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
