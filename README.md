# Shutterbug.js

## Overview ##

Shutterbug has two parts: a browser JavaScript library for taking html snapshots, and a server side utility for turning those html snapshots into images. This repository consists of JavaScript library.

## Server-side tool

https://github.com/concord-consortium/shutterbug-lambda

## Requirements & Dependencies

shutterbug.js requires [JQuery](http://jquery.com/) and expects JQuery to be found via window.jQuery or available as npm module.

## Basic usage

Include the following javascript in your pages:

     <script src='shutterbug.js' type='text/javascript'></script>

Elsewhere in your javascript, something like this:

    Shutterbug.snapshot({
      selector: '#sourceSelector', // anything accepted by jQuery, it can be DOM element too!
      dstSelector: '#destinationSelector', // optional
      done: callbackFn, // optional
      fail: failCallbackFn, // optional
      always: alwaysCallbackFn, // optional
      server: '//your.domain.com/shutterbug', // optional, default: "//snapshot.concord.org/shutterbug"
      format: 'jpeg', // optional, default: 'png'
      quality: 0.85 // optional, default: 1
    });

This will replace the contents of `$("#destinationSelector")` with an image tag which will magically spring into existence. `callbackFn` is an optional callback function which will be invoked with the image source. You can use either of them. Note that all the options are passed using simple object literal.

There are also shortcuts available:

    Shutterbug.snapshot('#sourceSelector', otherOptions);
    Shutterbug.snapshot('#sourceSelector', callbackFn, otherOptions);
    Shutterbug.snapshot('#sourceSelector', '#destinationSelector', otherOptions);

## Iframe'able content

By itself `shutterbug.js` is useful for authors of iframe'able content. With `shutterbug.js` on the iframe'd page, the parent window can request an html snapshot even if the iframe'd page is on a different domain. To enable this functionality you need to add the following lines to your iframe'able page:

    <script src="shutterbug.js"></script>
    <script>Shutterbug.enable('body');</script>

## Advanced usage

### IFrame support

If the element being snapshot'd is an iframe then the iframe needs to handle a postMessage API.
Shutterbug will run something like the following JS to get the html of the iframe

    iframe.contentWindow.postMessage(JSON.stringify({
      type: 'htmlFragRequest',
      id: id
    }), "*");

It is passing a JSON message that specifies the 'type' of message and passes an id so the caller can match up the response.

The iframe should respond by posting back to the source window a message like:

    message.source.postMessage(JSON.stringfy({
      type:  'htmlFragResponse',
      value: {
        content: 'htmlContent'
        css: '<div><link rel='stylesheet'..><style>...</style></div>',
        width: width,
        height: height,
        base_url: 'url that resource urls in content and css are relative to'
        },
      id:    id  // id sent in in the 'htmlFragRequest'
    }), message.origin);

The `shutterbug.js` script actually adds a handler for this postMessage API when the `Shutterbug.enable` is called.
So if shutterbug is included in the iframe html as described in the Usage section above, then a parent page can snapshot the iframe.

You could also reimplement this API in the html of the iframe if you'd like. However the shutterbug implementation includes some useful things like finding and including all the css on the page, and 'serializing' canvas elements into images.

### Shutterbug JQuery custom events ###

Shutterbug emits a jQuery custom event called `shutterbug-saycheese` just prior to copying styles, elements, and canvas contents to the document fragment. This allows applications to do any preparation required before they are ready to be snapshotted.

In your application, you can register your event-handler like this:

      $(window).on('shutterbug-saycheese', function() {
        api.renderCanvas();
      });

After all elements are copied, emits a `shutterbug-asyouwere` event.

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install
```
Then you can build the project files using:
```
npm run build
```
or start webpack dev server:
```
npm run server 
```
and open [http://localhost:8080/demo](http://localhost:8080/demo).

### Code style

This project uses StandardJS style: https://standardjs.com

Before committing your changes should run:
```
npm run lint 
```
and check if there are some errors. Most of them will be fixed automatically since we use `--fix` flag.
Also, `js/peels` directory is ignored as it's based on the external codebase and keeping it similar
to the original code might be useful in the future.

* Demos:
    * You can see the current demos in the [github pages](http://concord-consortium.github.io/shutterbug.js/demo/)
    * Useful examples are available in `public/demo`.
    * They use default Shutterbug server which is specified in `js/default-server.js`. When you develop server-side features, you might want to overwrite its value to local server, so all the examples will automatically use it.

## Changes ##
*  October 12, 2017 - v1.0.0
    * Works with the new server based on Chrome Headless and AWS Lambda
    * A few client-side fixes that ensure that snapshot looks right (dimensions, CSS, etc.)
    * New build system (brunch replaced with webpack)
    * Code cleaned up and refactored to use ES6 syntax
    * All the examples are refactored, so they're consistent and look cleaner, also added a few new ones
    * Handling of HDPI canvases and video elements

*  March 30, 2016
    * Add .on and .off methods to the Shutterbug API
    
*  December 18, 2015
    * Use relative paths in require() calls, so Shutterbug can work in NodeJS / NPM env.
    * Publish Shutterbug as NPM package.
    
*  October 6, 2015
    * Minor change: Video example was incorrectly specifying the development server.
    
*  Sept 10, 2015 – v0.5.7
    * Add support for snapshotting `<video>` elements. (@dougmartin)

*  December 15, 2014 – v0.5.4
    * Basic snapshot method is used when S3 direct upload fails.

*  December 7, 2014 – v0.5.3
    * Bug fixes.

*  December 4, 2014 – v0.5.0
    * The first version after separation from the [server-side tool](https://github.com/concord-consortium/shutterbug).

## License ##

[MIT](http://www.opensource.org/licenses/MIT)
