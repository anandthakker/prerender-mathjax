
var debug = require('debug')('prerender-mathjax:example')
    // koa
    koa = require('koa'),
    send = require('koa-send'),
    // prerender-mathjax
    prerenderMath = require('./lib/prerender-mathjax'),
    stripmj = require('./lib/strip-mathjax-scripts');

var prerenderMathjax = require('./lib/prerender-mathjax');

module.exports = server;

function server(rootpath, options) {

  var prerender = prerenderMathjax(options);

  var app = koa();
  
  app.use(function* (next) {
    debug('serve', this.path);
    
    // Using koa-send to put the requested file onto this.body
    //
    // This is just for this example.  prerender-mathjax simply expects
    // this.body to be a String, Buffer, or Stream.
    //
    yield send(this, this.path, { root: rootpath });

    // The main event: if `prerender` is a query parameter, then prerender
    // the math using selected given renderer.
    match = /prerender=(MML|SVG)/.exec(this.querystring);
    if(match !== null)
      yield prerender(this, {renderer: match[1]});

    // Just a little helper function to strip out any MathJax-related <script>
    // elements.  Presumably, the reason we're prerendering is because we don't
    // want MathJax running on the client side.
    if(/stripmj/.test(this.querystring))
      stripmj(this);

    // Yield downstream.  You could also put this before the prerendering,
    // particularly if you had downstream middleware generating content that might
    // include math.
    yield* next;
  });
  
  return app;
}

if(require.main === module) {  
  // either use current directory or command line argument as root path
  // to serve files from.
  var rootpath = process.argv.length > 2 ? process.argv[2] : __dirname;
  var port = process.env.PORT || 3000;
  server(rootpath, {
    MathJax: {
      menuSettings: {semantics: true},
      SVG: {font: "TeX"}
    }
  })
  .listen(port, function() {
    console.log("Server listening on "+port);
    console.log("Use:\nhttp://localhost:"+port+"/filename.html?prerender={SVG|MML}[&stripmj=true]");
  });
}
