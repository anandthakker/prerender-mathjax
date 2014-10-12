"use strict"

var debug = require('debug')('prerender-mathjax:strip-mathjax'),
    trumpet = require('trumpet'),
    concat = require('concat-stream');

module.exports = function() {
  return function* stripMathjaxScripts(next) {
    if(this.body && typeof this.body.pipe === 'function' &&
      /stripmj/i.test(this.querystring)) {
        
      debug('stripping')
      this.body = this.body.pipe(stripstream({
        'script[src*="MathJax.js"]': /.*/,
        'script': /mathjax/i
        }));
    }
    yield* next;
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
          debug('pass');
          stream.end(contents);
        }
      }))
    });
  }
  return tr;
}
