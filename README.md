# Shutterbug.js

## Overview ##

Shutterbug has two parts: a browser JavaScript library for taking html snapshots, and a server side utility for turning those html snapshots into images. This repository consists of JavaScript library.

By itself `shutterbug.js` is useful for authors of iframe'able content. With `shutterbug.js` on the iframe'd page, the parent window can request an html snapshot even if the iframe'd page is on a different domain. To enable this functionality you need to add the following lines to your iframe'able page:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script src="shutterbug.js"></script>
    <script>new Shutterbug('body');</script>

`shutterbug.js` also includes the API to talk to the server side utility to generate a image of the html snapshot.

This library is built with [Brunch](http://brunch.io).

## Getting started
* Install (if you don't have them):
    * [Node.js](http://nodejs.org): `brew install node` on OS X
    * [Brunch](http://brunch.io): `npm install -g brunch`
    * [Bower](http://bower.io): `npm install -g bower`
    * Brunch plugins and Bower dependencies: `npm install & bower install`.
* Run:
    * `brunch watch --server` — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * `brunch build -e dist` — builds dist files
* Learn:
    * `public/` dir is fully auto-generated and served by HTTP server.  Write your code in `app/` dir.
    * Place static files you want to be copied from `app/assets/` to `public/`.
    * [Brunch site](http://brunch.io), [Chaplin site](http://chaplinjs.org)
