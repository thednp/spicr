# Spicr - Modern Content Showcase Component
The mobile first, multi layer slider / carousel component for the modern web.

[![NPM Version](https://img.shields.io/npm/v/spicr.svg?style=flat-square)](https://www.npmjs.com/package/spicr)
[![NPM Downloads](https://img.shields.io/npm/dm/spicr.svg?style=flat-square)](http://npm-stat.com/charts.html?package=spicr)
[![jsDeliver](https://data.jsdelivr.com/v1/package/npm/spicr/badge)](https://www.jsdelivr.com/package/npm/spicr)

# Demo
Download the package and check the demo folder, or check it online [here](http://thednp.github.io/spicr/).

# Spicr Highlights
* Mobile First Design
* ES6/ES7 sources and powerful build tools
* SCSS sources with flexible mixins
* Powered by [KUTE.js](http://thednp.github.io/kute.js)
* Multi-purpose markup
* Provides a set of options for JavaScript initialization
* Powerful DATA API that allows you to automatically initiate or set animation parameters
* Modern browsers supported and semi-modern alike with a special polyfill for IE10+ provided
* Fallbacks and polyfills for IE9+

# NPM
You can install Spicr via NPM:

```
$ npm install spicr
```

# Browser Usage
Download the [latest package](https://github.com/thednp/spicr/archive/master.zip). unpack and inspect the contents. You need to copy the `spicr.js` and `spicr.css` or their minified variations to your app `assets` folders as follows.
Link the required CSS in your document `<head>` tag
```html
<link href="../assets/css/spicr.css" rel="stylesheet">
```

Link the required JS in your document  `<body>` tag, though it should work in the `<head>` as well
```html
<script src="../assets/js/spicr.js"></script>
```

Initiate the function for your elements at the end of your `<body>` tag
```javascript
<script>
var myMenu = new Spicr('selector');
</script>
```

A minimalistic markup example:

```markup
<div id="mySpicr" class="spicr spicr-slider">
  <!-- pages navigation -->
  <ol class="spicr-pages">
    <li data-slide-to="0" class="active"></li>
    <li data-slide-to="1"></li>
  </ol>
  <div class="spicr-inner">
    <div class="item active">
        <!-- item content, we talk about this in a sec -->
    </div>
    <div class="item">
      <div class="item-bg spicr-layer" data-duration="700" data-move="z:150" data-easing="cubicOut" style="background-image: url(../images/your-image.jpg);"></div>
      <div class="container">
        <!-- use any wrapper for your spicr-layer -->
        <div class="d-flex perspective">
          <div class="spicr-layer" data-move="z:250" data-delay="200" data-duration="800" data-rotate="z:15deg" data-easing="easingBackOut">
              <!-- valid HTML goes here -->                                  
          </div>
      </div>
      </div>
    </div>
  </div>  
</div>
```

Alternatively you can use a carousel-like markup:

```markup
<div id="mySpicr" class="spicr spicr-carousel" data-duration="700" data-move="x:150" data-easing="easingExponentialOut" data-interval="5000">
  <!-- pages navigation -->
  <ol class="spicr-pages">
    <li data-slide-to="0" class="active"></li>
    <li data-slide-to="1"></li>
  </ol>
  <div class="spicr-inner">
    <div class="item active">
        <!-- item content, we talk about this in a sec -->
    </div>
    <div class="item">
      <div class="container">
        <!-- use any wrapper -->
        <div class="perspective d-flex justify-content-center">
          <div class="spicr-layer">
              <!-- valid HTML goes here -->                                  
          </div>
      </div>
      </div>
    </div>
  </div>  
</div>
```

Other initialization and markup options apply, explained in [the demo](http://thednp.github.io/spicr/).


# ES6/ES7
```javascript
import Spicr from 'spicr'

let mySpicr = new Spicr('#mySpicr')
```

# Node
```javascript
// get and store it
var Spicr = require("spicr");

// initialize it
var mySpicr = new Spicr('#mySpicr');
```


# Build Tools
You have 3 build tools for building custom builds

* `$ npm run build` - to compile and minify the ES6/ES7 source **spicr** and **spicr.min.js**
* `$ npm run compile` - to compile and minify the **spicr.scss** and other demo related sources
* `$ npm run bundle` - to execute both the above in paralel
* `$ npm run polyfill` - to build the polyfills

# Custom JS Builds
You can create your own custom builds, here's how:
* create a new file for instance `src/js/my-spicr.js`, 
* copy the content of any of the `index.js`, `standalone.js`, `standalone-legacy.js`, `standalone-matrix.js` files and customize to your need
* run the below script

* run `npm run custom-build INPUTFILE:src/my-spicr.js,OUTPUTFILE:path-to/your-build.js,FORMAT:cjs,MIN:false`
  **  `INPUTFILE` - allows you to specify the source file path
  **  `OUTPUTFILE` - allows you to specify the output file path
  **  `MIN` - when true, it will compress the output
  **  `FORMAT` - umd|cjs|esm and any format you specify or configure your rollup for

# Custom CSS Builds
You can create your own custom styling, here's a quickie:
* create a new file for instance `src/scss/my-spicr.scss`, 
* include the mixins and variables' values you need (check out the demos for more)
* run the below script

```
node compile.js INPUTFILE:src/scss/my-spicr.scss OUTPUTFILE:path-to/src/css/my-spicr.min.css MIN:true
```
Compiler options:
*  `INPUTFILE` - allows you to specify the source file path
*  `OUTPUTFILE` - allows you to specify the output file path
*  `MIN` - when true, it will compress the output


# License
[MIT License](https://github.com/thednp/spicr/blob/master/LICENSE)
