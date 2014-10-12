
var debug = require('debug')('prerender-mathjax:example')
    // koa
    koa = require('koa'),
    send = require('koa-send'),
    // prerender-mathjax
    rendermath = require('..'),
    stripmj = require('../lib/strip-mathjax-scripts');


var app = koa();

var rootpath = process.argv.length > 2 ? process.argv[2] : __dirname;

app.use(function* (next) {
  debug('serve', this.path);
  yield send(this, this.path, { root: rootpath });
  yield* next;
});

app.use(rendermath())
app.use(stripmj());

app.listen(3000);
