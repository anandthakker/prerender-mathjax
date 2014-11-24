"use strict";

var debug = require('debug')('prerender-mathjax:main'),
    send = require('koa-send');

var through = require('through2'),
    concat = require('concat-stream'),
    mjAPI = require('MathJax-node'),
    jsdom = require('jsdom').jsdom;

var promisify = require('./promisify'),
    defaultTypsetOptions = require('../mathjax-defaults');

var mathjaxStarted = false;

module.exports = prerenderMathjax;
module.exports.processHTML = processHTML

function prerenderMathjax(mathjaxApiConfig) {
  
  // only allow api to be initialized once.
  if(!mathjaxStarted) {
    mjAPI.config(mathjaxApiConfig);
    mjAPI.start();
    mathjaxStarted = true;
  } else {
    console.warn("MathJax-node API already initialized; ignoring options!");
    console.warn("See https://github.com/mathjax/MathJax-node/issues/37");
  }
  
  return function* (context, typesetOptions) {
    debug('request', context.method, context.url);
    
    if(context.body) {
      // TODO: avoid context stream wrapping and unwrapping :yuck:
      var html = typeof context.body.pipe === 'function' ?
        yield collectHtml(context.body) :
        context.body

      debug('original file', html);
      
      context.body = through.obj();
      context.body.end(yield processHTML(html, typesetOptions));
    }
  }
}


var collectHtml = promisify('collectHtml', function (stream, callback) {
  stream.pipe(concat({encoding: 'string'}, function(data) {
    debug('collected', data);
    callback(null, data);
  }));
});


var typeset = promisify('mjAPI_typeset', mjAPI.typeset, true);
function processHTML(html, typesetOptions) {
  var opts = {};
  for (let opt in typesetOptions) { opts[opt] = typesetOptions[opt]; }
  for (let opt in defaultTypsetOptions) { 
    if (! (opt in opts)) opts[opt] = defaultTypsetOptions[opt];
  }
  if(/mml/i.test(opts.renderer) || opts.renderer === 'NativeMML') {
    opts.renderer = 'NativeMML';
  }
  else if(/svg/i.test(opts.renderer)) {
    opts.renderer = 'SVG';
  } else {
    throw new Error("Invalid renderer supplied in options: "+opts.renderer);
  }
  
  debug('typeset', typesetOptions);

  var document = jsdom(html,null,{features:{FetchExternalResources: false}});
  opts.html = document.body.innerHTML;
  opts.xmlns = getXMLNS(document);
  return typeset(opts).then(function (result) {
    debug('mathjax processed result', result);
    document.body.innerHTML = result.html;
    return "<!DOCTYPE html>\n"+document.documentElement.outerHTML;
  });
}


/** * ----------------------------------------------------------------------
 *
 *  getXMLNS below taken from MathJax-node/bin/page2mml
 *
 *  Copyright (c) 2014 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use context file except in compliance with the License.
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
