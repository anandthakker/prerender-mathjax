/**
Adapted from github.com/normalize/mz

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var Promise = require('native-or-bluebird');

module.exports = function promisify_mz_modified(name, fn, noErrorArg) {
    return eval('(function ' + name + '() {\n'
      + 'var len = arguments.length\n'
      + 'var args = new Array(len + 1)\n'
      + 'for (var i = 0; i < len; ++i) args[i] = arguments[i]\n'
      + 'var lastIndex = i\n'
      + 'return new Promise(function (resolve, reject) {\n'
        + 'args[lastIndex] = makeCallback(resolve, reject, ' + !!noErrorArg + ')\n'
        + 'fn.apply(null, args)\n'
      + '})\n'
    + '})')
  }

function makeCallback(resolve, reject, noErrorArg) {
  return function(err, value) {
    if(noErrorArg) {
      value = err;
      err = null;
    }
    if (err) {
      reject(err)
    } else {
      var len = arguments.length
      if (len > 2) {
        var values = new Array(len - 1)
        for (var i = 1; i < len; ++i) {
          values[i - 1] = arguments[i]
        }
        resolve(values)
      } else {
        resolve(value)
      }
    }
  }
}
