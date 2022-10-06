# Shutterbug.js

## Overview ##

Shutterbug has two parts: a browser JavaScript library for taking html snapshots, and a server side utility for turning those html snapshots into images. This repository consists of JavaScript library.

## Examples

http://concord-consortium.github.io/shutterbug.js/demo/

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
      server: '//your.domain.com/shutterbug' // optional, default: 'https://fh1fzvhx93.execute-api.us-east-1.amazonaws.com/production'
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

## Canvas and Video elements

Shutterbug.js will try to automatically handle `<canvas>` and `<video>` tags. It will try to replace them with a `<img>` that has a dataURI src with the content from the canvas or video.  This will only work of the canvas is not tainted.  So for a canvas element if it has been loaded with images then those images need to come from the same domain as the page that is taking the snapshot. If you are running shutterbug.js in an iframe that means the video needs to be on the same domain as the iframe.

It is possible to snapshot cross origin videos if the video tag has a `crossorigin=anonymous` attribute and the video file handles the Origin header and sends down the correct CORS headers. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-crossorigin
Additional info is here: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin

This same approach might work for `<canvas>` if any images loaded into had the crossorigin attribute set. This hasn't been tested though. More details are here: https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image

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
and open [http://localhost:8080/demo/](http://localhost:8080/demo/).

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

### Using local shutterbug in local application

You can include shutterbug.js in another node based application using `npm link`
So the npm documentation for more details on that command.

However webpack does some fancy stuff with symlinks that breaks the way this library
is loading jQuery as an 'external'. The solution that worked for me was to add
the following configuration to the webpack.config.js of the application (not the library)

```
resolve: { symlinks: false }
```

Without this you will see an error in the application about not being able to find
jquery within the shutterbug directory.

## Debugging LARA Interactive ##

If the interactive doesn't use authored state you can use http://concord-consortium.github.io/shutterbug.js/demo/iframe-test.html

If the interactive uses authored state the page above won't work because it doesn't initialize the interactive. So here are a couple options to work around this.

The best approach is to run shutterbug-lambda locally, and run LARA locally. In your LARA folder add a variable to .env

    SHUTTERBUG_URI=http://localhost:4000

Another approach is to get the serialized html from the interactive and save it to a local file and then add the URL to that local file to http://concord-consortium.github.io/shutterbug.js/demo/iframe-test.html

If you are getting back a broken image, you can get the serialized html by trying to snapshot the interactive on a LARA staging and look at the browser network log. You'll see a result from /make-snapshot that includes the URL to image. Replace the .png with .html and you'll have a URL to the html that was sent to shutterbug-lamba. You can use this URL directly and it will likely show the same problem you see when using the real interactive in LARA. But it is not technically exactly the same as what is being sent to the shutterbug-lambda server from LARA. To make the request be closer you need to get the html content out of the iframe from that .html file. You can do that by opening the file in a browser, inspect it with developer tools, expand the iframe element, select the html element inside of the iframe and edit it as html. This will give you a text field of the html. The same html is availble directly in the srcdoc attribute of the iframe, but it is has escaped elements in it. Finally save this html content as a new file locally, serve it with a webserver, and put the URL to that file into the iframe-test.html page.

If you are getting an error from the shutterbug server, you will need to check the cloudwatch logs for the error and from there you can find the url to the initial html file. From there you can follow the steps above to extact its iframe contents.

It would also be possible to make a new lara-interactive-test.html page which allowed you to pass in some authored state to the interactive which might make debugging easier.

## Changes ##

* March 16, 2020 - v1.3.0
    * Support css rules that are added dynamically, for example styled-components will do this

* January 16, 2020 - v1.2.0
    * Switch to using srcdoc attribute for nested iframes, this is necessary to work with newer versions of Chrome

* December 19, 2017 - v1.1.0
    * Support HTML elements referencing Blob instances (e.g. CSS links or images using href/src="blob:http://example.com/abc-xyz-123")
    * Fix snapshot of Video elements

* October 14, 2017 - v1.0.1
    * `dist/shutterbug.js` is now transpiled to ES5 compatible code

* October 12, 2017 - v1.0.0
    * Works with the new server based on Chrome Headless and AWS Lambda
    * A few client-side fixes that ensure that snapshot looks right (dimensions, CSS, etc.)
    * New build system (brunch replaced with webpack)
    * Code cleaned up and refactored to use ES6 syntax
    * All the examples are refactored, so they're consistent and look cleaner, also added a few new ones
    * Handling of HDPI canvases and video elements

* March 30, 2016
    * Add .on and .off methods to the Shutterbug API

* December 18, 2015
    * Use relative paths in require() calls, so Shutterbug can work in NodeJS / NPM env.
    * Publish Shutterbug as NPM package.

* October 6, 2015
    * Minor change: Video example was incorrectly specifying the development server.

* Sept 10, 2015 – v0.5.7
    * Add support for snapshotting `<video>` elements. (@dougmartin)

* December 15, 2014 – v0.5.4
    * Basic snapshot method is used when S3 direct upload fails.

* December 7, 2014 – v0.5.3
    * Bug fixes.

* December 4, 2014 – v0.5.0
    * The first version after separation from the old [server-side tool](https://github.com/concord-consortium/shutterbug) (not used anymore).

## License ##

[MIT](http://www.opensource.org/licenses/MIT)
