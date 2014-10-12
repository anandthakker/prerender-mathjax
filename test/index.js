var fs = require('fs');
var request = require('supertest');
var send = require('koa-send');
var rendermath = require('..');
var stripmj = require('../lib/strip-mathjax-scripts');
var koa = require('koa');

function app() {
  var app = koa();
  app.use(function* (next) {
    yield send(this, this.path, { root: __dirname + '/fixtures' });
    yield* next;
  });
  app.use(rendermath());
  app.use(stripmj());
  return app.listen();
}

describe('prerender-mathjax', function() {
  describe('when ?stripmj=true', function () {
    it('should strip mathjax scripts', function(done){
      request(app())
      .get('/simple.html?stripmj=true')
      .expect(200)
      .expect(/<head>\s*<\/head>/)
      .end(done);
    })
    
    it('shouldn\'t strip non-mathjax scripts', function(done) {
      request(app())
      .get('/nomathjax.html')
      .expect(200)
      .expect(/(script.*){2}/)
      .end(done);
    });
  })
  
  describe('when ?rendermath=true', function() {
    it('should prerender latex equations to MML', function (done) {
      request(app())
      .get('/simple.html?rendermath=true')
      .expect(200)
      .expect(/<math\s*xmlns\s*=\s*"http:\/\/www\.w3\.org\/1998\/Math\/MathML/)
      .end(done);
    })
  })

})
