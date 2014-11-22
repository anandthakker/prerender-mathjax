var fs = require('fs');
var request = require('supertest');
var send = require('koa-send');
var prerender = require('../server');
var koa = require('koa');

describe('prerender-mathjax', function() {
  var mjapioptions = {
    MathJax: {
      menuSettings: {semantics: true},
      SVG: {font: "TeX"}
    }
  };
  
  var MML_URL = '/simple.html?prerender=MML';
  var MML_BODY = /<math\s*xmlns\s*=\s*"http:\/\/www\.w3\.org\/1998\/Math\/MathML/;
  
  var SVG_URL = '/simple.html?prerender=SVG';
  var SVG_BODY = /svg/;
  
  describe('strip-mathjax-scripts', function () {
    it('should strip mathjax scripts', function(done){
      request(prerender(__dirname+'/fixtures', mjapioptions).listen())
      .get('/simple.html?stripmj=true')
      .expect(200)
      .expect(/<head>\s*<\/head>/)
      .end(done);
    })
  
    it('should NOT strip NON-mathjax scripts', function(done) {
      request(prerender(__dirname+'/fixtures', mjapioptions).listen())
      .get('/nomathjax.html')
      .expect(200)
      .expect(/(script.*){2}/)
      .end(done);
    });
  })
  
  it('should prerender latex equations to MML', function (done) {
    request(prerender(__dirname+'/fixtures', mjapioptions).listen())
    .get(MML_URL)
    .expect(200)
    .expect(MML_BODY)
    .end(done);
  });
  
  it('should handle multiple MML requests', function(done) {
    var count = 10;
    var server = prerender(__dirname+'/fixtures', mjapioptions).listen();
    
    function requests(count) {
      if(count-- < 0)
        return done();

      request(server)
      .get(MML_URL)
      .expect(200)
      .expect(MML_BODY)
      .end(function() {requests(count)});
    }
    
    this.timeout(count*1000);
    requests(count);
  });
  
  
  it('should prerender latex equations to SVG', function(done) {
    request(prerender(__dirname+'/fixtures', mjapioptions).listen())
    .get(SVG_URL)
    .expect(200)
    .expect(SVG_BODY)
    .end(done);
  });
  
  
  it('should handle multiple SVG requests', function(done) {
    var count = 10;
    var server = prerender(__dirname+'/fixtures', mjapioptions).listen();
    
    function requests(count) {
      if(count-- < 0)
        return done();

      request(server)
      .get(SVG_URL)
      .expect(200)
      .expect(SVG_BODY)
      .end(function() {requests(count)});
    }
    
    this.timeout(count*1000);
    requests(count);
  });
  

  it('should handle requests for different output formats', function(done) {
    var count = 10;
    var server = prerender(__dirname+'/fixtures', mjapioptions).listen();
    
    function requests(count) {
      if(count-- < 0)
        return done();
  
      request(server)
      .get(count % 2 == 0 ? SVG_URL : SVG_URL)
      .expect(200)
      .expect(count % 2 == 0 ? SVG_URL : SVG_BODY)
      .end(function() {requests(count)});
    }
    
    this.timeout(count*1000);
    requests(count);
  });
  


})
