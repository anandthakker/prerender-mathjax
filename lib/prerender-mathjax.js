"use strict";

var debug = require('debug')('prerender-mathjax:main'),
    send = require('koa-send');

var through = require('through2'),
    concat = require('concat-stream'),
    mjAPI = require('MathJax-node'),
    jsdom = require('jsdom').jsdom;

var promisify = require('./promisify');


module.exports= function renderMath(opts) {
  var defaults = require('../mathjax');
  
  opts = opts || {};
  for (let opt in defaults) {
    opts[opt] = opts[opt] || defaults[opt];
  }

  debug('config', opts);
  mjAPI.config({MathJax: {menuSettings: {semantics: opts.semantics}}});

  return function* (next) {
    debug('request', this.method, this.url);
    
    if(this.body && /rendermath/i.test(this.querystring)) {
      debug('render math!', this.body)
      mjAPI.start();

      // TODO: avoid this stream wrapping and unwrapping :yuck:
      var html = typeof this.body.pipe === 'function' ?
        yield collectHtml(this.body) :
        this.body

      debug('original file', html);

      this.body = through.obj();
      this.body.end(yield processHTML(html, opts));
    }
    
    // koa-static doesn't do this, but I think it should...koajs/static#36
    yield* next;
  }
}

var collectHtml = promisify('collectHtml', function (stream, callback) {
  stream.pipe(concat({encoding: 'string'}, function(data) {
    debug('collected', data);
    callback(null, data);
  }));
});


/** * ----------------------------------------------------------------------
 *
 * MathJax logic.
 *
 * Adapted from from: MathJax-node/bin/page2mml
 *
 *  Copyright (c) 2014 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

function processHTML(html, opts) { // Changed from original to 'thunkified' form.
  return function (callback) {
    var document = jsdom(html,null,{features:{FetchExternalResources: false}});
    var xmlns = getXMLNS(document);
    try {
      mjAPI.typeset({
        html:document.body.innerHTML,
        renderer:"NativeMML",
        inputs: opts.format,
        equationNumbers: opts.eqno,
        singleDollars: !opts.nodollars,
        ex: opts.ex, width: opts.width,
        linebreaks: opts.linebreaks,
        xmlns:xmlns
      }, function (result) {
        debug('mathjax processed result', result);
        try {
          document.body.innerHTML = result.html;
          var HTML = "<!DOCTYPE html>\n"+document.documentElement.outerHTML.replace(/^(\n|\s)*/,"");
          callback(null, HTML);
        } catch (e) {
          callback(e);
        }
      });
    } catch (e) {
      debug('mathjax error', e);
      callback(e);
    }
  }
}

//
//  Look up the MathML namespace from the <html> attributes
//
function getXMLNS(document) {
  var html = document.head.parentNode;
  for (var i = 0, m = html.attributes.length; i < m; i++) {
    var attr = html.attributes[i];
    if (attr.nodeName.substr(0,6) === "xmlns:" &&
        attr.nodeValue === "http://www.w3.org/1998/Math/MathML")
             {return attr.nodeName.substr(6)}
  }
  return "mml";
}
