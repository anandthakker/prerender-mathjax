prerender-mathjax
=============

Use [MathJax][1] to prerender math in HTML documents on the server side.

# Installation

```bash
npm install --save prerender-mathjax
```

# Usage

## As a Node server:

```javascript
var prerenderServer = require('prerender-mathjax/server');

prerenderServer(ROOT, options).listen(3000);
```

Where `ROOT` is the path from which to serve files and `options` is the config
object expected by the `config` method of the MathJax-node API. Example config:

```javascript
var options = {
  MathJax: {
    menuSettings: {semantics: true},
    SVG: {font: "TeX"}
  }
}
```

Server will serve files from `ROOT` and respect the following query params:
- `prerender={MML|SVG}` - prerender math using the given output format.
- `stripmj` - strip out MathJax-related &lt;script> tags.

## As Koa middleware:

```javascript
var prerender = require('prerender-mathjax')(options);

// Upstream middleware that populates `this.body` with HTML (can be a String,
// Buffer, or Stream).

app.use(function*(next) {
  yield prerender(this, options);
  yield* next;
})
```

Where `options` is the config object expected by the `config` method of the 
MathJax-node API. (See above for example.)

This is *just* the prerendering logic.  To make it contingent on query 
parameters and to strip out MathJax &lt;script> elements, see 
[the server code](/server.js).


## From the command line:

```bash
node --harmony server.js test/fixtures/
```

Point to http://localhost:3000/simple.html.
Result:

```html
<html>
<head>
  <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
  </script>
  <script type="text/javascript">
    MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)']
        ],
        processEscapes: true
      }
    });
  </script>
</head>
<body>
  <div>$x^3 + y^3 = z^3$</div>
</body>
</html>
```

Point to http://localhost:3000/simple.html?prerender=MML&stripmj=true.
Result:

```html
<html>
<head>
</head>
<body>
  <div>
    <math xmlns="http://www.w3.org/1998/Math/MathML">
      <semantics>
        <mrow>
          <msup>
            <mi>x</mi>
            <mn>3</mn>
          </msup>
          <mo>+</mo>
          <msup>
            <mi>y</mi>
            <mn>3</mn>
          </msup>
          <mo>=</mo>
          <msup>
            <mi>z</mi>
            <mn>3</mn>
          </msup>
        </mrow>
        <annotation encoding="application/x-tex">x^3 + y^3 = z^3</annotation>
      </semantics>
    </math>
  </div>
</body>
</html>
```

Point to http://localhost:3000/simple.html?prerender=SVG&stripmj=true.
Result:


```html
<html>
<head>
</head>
<body>
<style id="MathJax_SVG_styles">
  .MathJax_SVG_Display {
    text-align: center;
    margin: 1em 0em;
    position: relative;
    display: block!important;
    text-indent: 0;
    max-width: none;
    max-height: none;
    min-width: 0;
    min-height: 0;
    width: 100%}
  .MathJax_SVG .MJX-monospace {
    font-family: monospace}
  .MathJax_SVG .MJX-sans-serif {
    font-family: sans-serif}
  .MathJax_SVG {
    display: inline;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    font-size: 100%;
    font-size-adjust: none;
    text-indent: 0;
    text-align: left;
    text-transform: none;
    letter-spacing: normal;
    word-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    float: none;
    direction: ltr;
    max-width: none;
    max-height: none;
    min-width: 0;
    min-height: 0;
    border: 0;
    padding: 0;
    margin: 0}
  .MathJax_SVG * {
    transition: none;
    -webkit-transition: none;
    -moz-transition: none;
    -ms-transition: none;
    -o-transition: none}
  .mjx-svg-href {
    fill: blue;
    stroke: blue}
</style>

<span style="font-size: 100%; display: inline-block;" class="MathJax_SVG" role="textbox" aria-readonly="true">
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" style="vertical-align: -0.5ex; margin-left: 0ex; margin-right: -12.833ex; margin-bottom: 1px; margin-top: 1px;" width="12.833ex" height="2.5ex" viewBox="0 -854.1 5492.4 1083.1" role="math" aria-labelledby="MathJax-Element-1-Title MathJax-Element-1-Desc">
    <title id="MathJax-Element-1-Title">
      Equation
    </title>
    <desc id="MathJax-Element-1-Desc">
      x cube plus y cube equals z cube
    </desc>
    <g stroke="black" fill="black" stroke-width="0" transform="matrix(1 0 0 -1 0 0)" aria-hidden="true">
      <path stroke-width="10" d="M52 289Q59 331 106 386T222 442Q257 442 286 424T329 379Q371 442 430 442Q467 442 494 420T522 361Q522 332 508 314T481 292T458 288Q439 288 427 299T415 328Q415 374 465 391Q454 404 425 404Q412 404 406 402Q368 386 350 336Q290 115 290 78Q290 50 306 38T341 26Q378 26 414 59T463 140Q466 150 469 151T485 153H489Q504 153 504 145Q504 144 502 134Q486 77 440 33T333 -11Q263 -11 227 52Q186 -10 133 -10H127Q78 -10 57 16T35 71Q35 103 54 123T99 143Q142 143 142 101Q142 81 130 66T107 46T94 41L91 40Q91 39 97 36T113 29T132 26Q168 26 194 71Q203 87 217 139T245 247T261 313Q266 340 266 352Q266 380 251 392T217 404Q177 404 142 372T93 290Q91 281 88 280T72 278H58Q52 284 52 289Z">
      </path>
      <g transform="translate(577,362)">
        <path stroke-width="10" transform="scale(0.707)" d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z">
        </path>
      </g>
      <g transform="translate(1256,0)">
        <path stroke-width="10" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z">
        </path>
      </g>
      <g transform="translate(2261,0)">
        <path stroke-width="10" d="M21 287Q21 301 36 335T84 406T158 442Q199 442 224 419T250 355Q248 336 247 334Q247 331 231 288T198 191T182 105Q182 62 196 45T238 27Q261 27 281 38T312 61T339 94Q339 95 344 114T358 173T377 247Q415 397 419 404Q432 431 462 431Q475 431 483 424T494 412T496 403Q496 390 447 193T391 -23Q363 -106 294 -155T156 -205Q111 -205 77 -183T43 -117Q43 -95 50 -80T69 -58T89 -48T106 -45Q150 -45 150 -87Q150 -107 138 -122T115 -142T102 -147L99 -148Q101 -153 118 -160T152 -167H160Q177 -167 186 -165Q219 -156 247 -127T290 -65T313 -9T321 21L315 17Q309 13 296 6T270 -6Q250 -11 231 -11Q185 -11 150 11T104 82Q103 89 103 113Q103 170 138 262T173 379Q173 380 173 381Q173 390 173 393T169 400T158 404H154Q131 404 112 385T82 344T65 302T57 280Q55 278 41 278H27Q21 284 21 287Z">
        </path>
        <g transform="translate(504,362)">
          <path stroke-width="10" transform="scale(0.707)" d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z">
          </path>
        </g>
      </g>
      <g transform="translate(3500,0)">
        <path stroke-width="10" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z">
        </path>
      </g>
      <g transform="translate(4561,0)">
        <path stroke-width="10" d="M347 338Q337 338 294 349T231 360Q211 360 197 356T174 346T162 335T155 324L153 320Q150 317 138 317Q117 317 117 325Q117 330 120 339Q133 378 163 406T229 440Q241 442 246 442Q271 442 291 425T329 392T367 375Q389 375 411 408T434 441Q435 442 449 442H462Q468 436 468 434Q468 430 463 420T449 399T432 377T418 358L411 349Q368 298 275 214T160 106L148 94L163 93Q185 93 227 82T290 71Q328 71 360 90T402 140Q406 149 409 151T424 153Q443 153 443 143Q443 138 442 134Q425 72 376 31T278 -11Q252 -11 232 6T193 40T155 57Q111 57 76 -3Q70 -11 59 -11H54H41Q35 -5 35 -2Q35 13 93 84Q132 129 225 214T340 322Q352 338 347 338Z">
        </path>
        <g transform="translate(473,362)">
          <path stroke-width="10" transform="scale(0.707)" d="M127 463Q100 463 85 480T69 524Q69 579 117 622T233 665Q268 665 277 664Q351 652 390 611T430 522Q430 470 396 421T302 350L299 348Q299 347 308 345T337 336T375 315Q457 262 457 175Q457 96 395 37T238 -22Q158 -22 100 21T42 130Q42 158 60 175T105 193Q133 193 151 175T169 130Q169 119 166 110T159 94T148 82T136 74T126 70T118 67L114 66Q165 21 238 21Q293 21 321 74Q338 107 338 175V195Q338 290 274 322Q259 328 213 329L171 330L168 332Q166 335 166 348Q166 366 174 366Q202 366 232 371Q266 376 294 413T322 525V533Q322 590 287 612Q265 626 240 626Q208 626 181 615T143 592T132 580H135Q138 579 143 578T153 573T165 566T175 555T183 540T186 520Q186 498 172 481T127 463Z">
          </path>
        </g>
      </g>
    </g>
  </svg>
</span>
</span>
<script type="math/tex">
  x^3 + y^3 = z^3
</script>


</body></html>
```


# Credits

* Makes major use of [Mathjax-node][2] and (of course) [MathJax][1] itself.


[1]: https://mathjax.org
[2]: https://github.com/mathjax/MathJax-node
