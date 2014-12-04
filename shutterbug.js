!function(){"use strict";var t="undefined"!=typeof window?window:global;if("function"!=typeof t.require){var e={},i={},r=function(t,e){return{}.hasOwnProperty.call(t,e)},a=function(t,e){var i,r,a=[];i=/^\.\.?(\/|$)/.test(e)?[t,e].join("/").split("/"):e.split("/");for(var n=0,s=i.length;s>n;n++)r=i[n],".."===r?a.pop():"."!==r&&""!==r&&a.push(r);return a.join("/")},n=function(t){return t.split("/").slice(0,-1).join("/")},s=function(e){return function(i){var r=n(e),s=a(r,i);return t.require(s,e)}},o=function(t,e){var r={id:t,exports:{}};return i[t]=r,e(r.exports,s(t),r),r.exports},l=function(t,n){var s=a(t,".");if(null==n&&(n="/"),r(i,s))return i[s].exports;if(r(e,s))return o(s,e[s]);var l=a(s,"./index");if(r(i,l))return i[l].exports;if(r(e,l))return o(l,e[l]);throw new Error('Cannot find module "'+t+'" from "'+n+'"')},u=function(t,i){if("object"==typeof t)for(var a in t)r(t,a)&&(e[a]=t[a]);else e[t]=i},c=function(){var t=[];for(var i in e)r(e,i)&&t.push(i);return t};t.require=l,t.require.define=u,t.require.register=u,t.require.list=c,t.require.brunch=!0}}(),require.register("scripts/default-server",function(t,e,i){i.exports="//shutterbug.herokuapp.com/shutterbug"}),require.register("scripts/html-tools",function(t,e,i){var r=jQuery;i.exports={cloneDomItem:function(t,e){var i=r(e);return i.addClass(t.attr("class")),i.attr("style",t.attr("style")),i.css("background",t.css("background")),i.attr("width",t.width()),i.attr("height",t.height()),i},generateFullHtmlFromFragment:function(t){return"<!DOCTYPE html><html><head><base href='"+t.base_url+"'><meta content='text/html;charset=utf-8' http-equiv='Content-Type'><title>content from "+t.base_url+"</title>"+t.css+"</head><body>"+t.content+"</body></html>"},dataURLtoBlob:function(t){if(-1===t.split(",")[0].indexOf("base64"))throw new Error("expected base64 data");for(var e=atob(t.split(",")[1]),i=t.split(",")[0].split(":")[1].split(";")[0],r=new Uint8Array(e.length),a=0;a<e.length;a++)r[a]=e.charCodeAt(a);return new Blob([r],{type:i})}}}),require.register("scripts/shutterbug-worker",function(t,e,i){function r(){return c++}function a(t){var e=t||{};if(!e.selector)throw new Error("missing required option: selector");this.element=e.selector,this.callback=e.done,this.failCallback=e.fail,this.alwaysCallback=e.always,this.imgDst=e.dstSelector,this.server=e.server||o,this.imageFormat=e.format||"png",this.imageQuality=e.quality||1,this._useIframeSizeHack=e.useIframeSizeHack,this.id=r(),this.iframeReqTimeout=l,this._postMessageHandler=this._postMessageHandler.bind(this)}var n=jQuery,s=e("scripts/html-tools"),o=e("scripts/default-server"),l=1500,u="function"==typeof window.Blob&&"function"==typeof window.Uint8Array,c=0;a.prototype.enableIframeCommunication=function(){n(document).ready(function(){window.addEventListener("message",this._postMessageHandler,!1)}.bind(this))},a.prototype.disableIframeCommunication=function(){window.removeEventListener("message",this._postMessageHandler,!1)},a.prototype.getHtmlFragment=function(t){var e=this,i=n(this.element),r=i.find("iframe").addBack("iframe");this._iframeContentRequests=[],r.each(function(t,i){e._postHtmlFragRequestToIframe(i,t)}),n.when.apply(n,this._iframeContentRequests).done(function(){i.trigger("shutterbug-saycheese");var r=n("<div>").append(n('link[rel="stylesheet"]').clone()).append(n("style").clone()).html(),a=i.width(),o=i.height(),l=i.clone();if(l.find("script").remove(),arguments.length>0){var u=arguments;l.find("iframe").addBack("iframe").each(function(t,e){null!=u[t]&&n(e).attr("src","data:text/html,"+s.generateFullHtmlFromFragment(u[t]))})}var c=i.find("canvas").addBack("canvas").map(function(t,e){var i=e.toDataURL("image/png"),r=s.cloneDomItem(n(e),"<img>");return r.attr("src",i),r});l.is("canvas")?l=c[0]:l.find("canvas").each(function(t,e){n(e).replaceWith(c[t])}),l.css({top:0,left:0,margin:0,width:a,height:o}),e._useIframeSizeHack&&(a=10);var h={content:n("<div>").append(l).html(),css:r,width:a,height:o,base_url:window.location.href};i.trigger("shutterbug-asyouwere"),t(h)})},a.prototype.getDomSnapshot=function(){this.enableIframeCommunication();var t=this,e=0,i=n("<span>");i.html(e),n(t.imgDst).html("creating snapshot: ").append(i),this.timer=setInterval(function(){e+=1,i.html(e)},1e3);var r=n(this.element).prop("tagName");switch(r){case"CANVAS":this.canvasSnapshot();break;default:this.basicSnapshot()}},a.prototype.canvasSnapshot=function(){if(!u)return this.basicSnapshot();var t=this;n.ajax({type:"GET",url:this.server+"/img_upload_url?format="+this.imageFormat}).done(function(e){t.directUpload(e)}).fail(function(){t.basicSnapshot()})},a.prototype.directUpload=function(t){var e=n(this.element),i=e[0].toDataURL("image/"+this.imageFormat,this.imageQuality),r=s.dataURLtoBlob(i),a=this;n.ajax({type:"PUT",url:t.put_url,data:r,processData:!1,contentType:!1}).done(function(){a._successHandler("<img src="+t.get_url+">")}).fail(function(t,e,i){a._failHandler(t,e,i)}).always(function(){a._alwaysHandler()})},a.prototype.basicSnapshot=function(){var t=this;this.getHtmlFragment(function(e){e.format=t.imageFormat,e.quality=t.imageQuality,n.ajax({url:t.server+"/make_snapshot",type:"POST",data:e}).done(function(e){t._successHandler(e)}).fail(function(e,i,r){t._failHandler(e,i,r)}).always(function(){t._alwaysHandler()})})},a.prototype._successHandler=function(t){if(this.imgDst&&n(this.imgDst).html(t),this.callback){var e=t.match(/src='([^']*)'/)[1];this.callback(e)}},a.prototype._failHandler=function(t,e,i){this.imgDst&&n(this.imgDst).html("snapshot failed"),this.failCallback&&this.failCallback(t,e,i)},a.prototype._alwaysHandler=function(){clearInterval(this.timer),this.disableIframeCommunication(),this.alwaysCallback&&this.alwaysCallback()},a.prototype.htmlSnap=function(){this.getHtmlFragment(function(t){var e=btoa(s.generateFullHtmlFromFragment(t));window.open("data:text/html;base64,"+e)})},a.prototype.imageSnap=function(){var t=this.imgDst,e=this.callback,i=this;this.imgDst=null,this.callback=function(r){window.open(r),i.imgDst=t,i.callback=e},this.getDomSnapshot()},a.prototype._postMessageHandler=function(t){function e(t,e,i){var r=t.data;if("string"==typeof r)try{r=JSON.parse(r),r.type===e&&i(r,t.source)}catch(a){}}e(t,"htmlFragRequest",this._htmlFragRequestHandler.bind(this)),e(t,"htmlFragResponse",this._htmlFragResponseHandler.bind(this))},a.prototype._htmlFragRequestHandler=function(t,e){this.iframeReqTimeout=null!=t.iframeReqTimeout?t.iframeReqTimeout:l,this.getHtmlFragment(function(i){var r={type:"htmlFragResponse",value:i,iframeReqId:t.iframeReqId,id:t.id};e.postMessage(JSON.stringify(r),"*")})},a.prototype._htmlFragResponseHandler=function(t){if(t.id===this.id){var e=null!=t.iframeReqId?t.iframeReqId:0;this._iframeContentRequests[e].resolve(t.value)}},a.prototype._postHtmlFragRequestToIframe=function(t,e){var i={type:"htmlFragRequest",id:this.id,iframeReqId:e,iframeReqTimeout:.6*this.iframeReqTimeout};t.contentWindow.postMessage(JSON.stringify(i),"*");var r=new n.Deferred;this._iframeContentRequests[e]=r,setTimeout(function(){"resolved"!==r.state()&&r.resolve(null)},this.iframeReqTimeout)},i.exports=a}),require.register("scripts/shutterbug",function(t,e,i){function r(t){function e(t){"string"==typeof t?a=t:"function"==typeof t?r=t:"object"==typeof t&&(n=t)}var i,r,a,n={};return 3===t.length?(n=t[2],e(t[1]),i=t[0]):2===t.length?(e(t[1]),i=t[0]):1===t.length&&(n=t[0]),i&&(n.selector=i),r&&(n.done=r),a&&(n.dstSelector=a),n}var a=e("scripts/shutterbug-worker");i.exports={snapshot:function(){var t=r(arguments),e=new a(t);e.getDomSnapshot()},enable:function(t){this.disable(),t=t||"body",this._iframeWorker=new a({selector:t}),this._iframeWorker.enableIframeCommunication()},disable:function(){this._iframeWorker&&this._iframeWorker.disableIframeCommunication()}}}),window.Shutterbug=require("scripts/shutterbug");