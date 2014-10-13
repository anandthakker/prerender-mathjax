"use strict"

var debug = require('debug')('prerender-mathjax:strip-mathjax'),
    trumpet = require('trumpet'),
    through = require('through2'),
    concat = require('concat-stream');

module.exports = function stripMathjaxScripts(context) {
  if(context.body) {
    debug('stripping')
    
    // wrap it in a stream if it isn't one.
    if(typeof context.body.pipe !== 'function') {
      var stream = through.obj();
      stream.end(context.body);
      context.body = stream;
    }
    
    context.body = context.body.pipe(stripstream({
      'script[src*="MathJax.js"]': /.*/,
      'script': /mathjax/i
    }));
  }
}
  
/*
selectors - a selector, regexp map.
the returned stream will strip any element that (a) is matched by one of the selectors,
and (b) whose content (as a string) is matched by the corresponding regexp.
*/
function stripstream(selectors) {
  var tr = trumpet();
  for (var selector in selectors) {
    tr.selectAll(selector, function(element) {
      var stream = element.createStream({outer: true});
      stream.pipe(concat({encoding: 'string'}, function(contents) {
        if(selectors[selector].test(contents)) {
          debug('strip', contents);
          stream.end('');
        } else {
          debug('pass', contents);
          stream.end(contents);
        }
      }))
    });
  }
  return tr;
}
