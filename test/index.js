var fs = require('fs');
var request = require('supertest');
var send = require('koa-send');
var prerender = require('../server');
var koa = require('koa');

describe('prerender-mathjax', function() {
  describe('strip-mathjax-scripts', function () {
    it('should strip mathjax scripts', function(done){
      request(prerender(__dirname+'/fixtures', {renderer: "MML"}).listen())
      .get('/simple.html?stripmj=true')
      .expect(200)
      .expect(/<head>\s*<\/head>/)
      .end(done);
    })
  
    it('should NOT strip NON-mathjax scripts', function(done) {
      request(prerender(__dirname+'/fixtures', {renderer: "MML"}).listen())
      .get('/nomathjax.html')
      .expect(200)
      .expect(/(script.*){2}/)
      .end(done);
    });
  })
  
  describe('{renderer: "SVG"}', function() {
    it('should prerender latex equations to SVG', function(done) {
      request(prerender(__dirname+'/fixtures', {renderer: "SVG"}).listen())
      .get('/simple.html?prerender=true')
      .expect(200)
      .expect(/svg/)
      .end(done);
    })
  })
  
  describe('{renderer: "MML"}', function() {
    it('should prerender latex equations to MML', function (done) {
      request(prerender(__dirname+'/fixtures', {renderer: "MML"}).listen())
      .get('/simple.html?prerender=true')
      .expect(200)
      .expect(/<math\s*xmlns\s*=\s*"http:\/\/www\.w3\.org\/1998\/Math\/MathML/)
      .end(done);
    })
  })
  


})
