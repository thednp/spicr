/*!
* Spicr v1.0.3 (http://thednp.github.io/spicr)
* Copyright 2017-2020 © thednp
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/
function queryElement(selector, parent) {
  var lookUp = parent && parent instanceof Element ? parent : document;
  return selector instanceof Element ? selector : lookUp.querySelector(selector);
}

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

var supportTouch = ('ontouchstart' in window || navigator.msMaxTouchPoints) || false;

var mouseHoverEvents = ('onmouseleave' in document) ? [ 'mouseenter', 'mouseleave'] : [ 'mouseover', 'mouseout' ];

var spicrConnect = {};

function processLayerData(elem,attributeString){
  var attributesArray = attributeString.trim().split(/[,|;]/), obj = {};
  attributesArray.map(function (x){
    var prop = x.split(/[:|=]/), pName = prop[0], pValue = prop[1],
    offsetType = /y/i.test(pName)||/v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';
    obj[pName] = /%/.test(pValue) ? parseFloat(pValue)*elem[offsetType]/100 : parseFloat(pValue);
  });
  return obj;
}

var defaultDuration = 500;

var defaultEasing = 'easingCubicOut';

function getLayerData(elem) {
  var translate = elem.getAttribute('data-translate'),
      rotate = elem.getAttribute('data-rotate'),
      scale = elem.getAttribute('data-scale'),
      origin = elem.getAttribute('data-transform-origin'),
      opacity = elem.getAttribute('data-opacity'),
      duration = elem.getAttribute('data-duration'),
      delay = elem.getAttribute('data-delay'),
      easing = elem.getAttribute('data-easing');
  return {
    translate : translate         ? processLayerData(elem,translate) : '',
    rotate    : rotate            ? processLayerData(elem,rotate) : '',
    origin    : origin            ? processLayerData(elem,origin) : '',
    scale     : scale             ? parseFloat(scale) : '',
    opacity   : opacity!=='false' ? 1 : 0,
    duration  : !isNaN(duration)  ? parseInt(duration) : defaultDuration,
    delay     : !isNaN(delay)     ? parseInt(delay) : 0,
    easing    : easing            ? easing : defaultEasing
  }
}

function getLayers(elem) {
  return Array.from(elem.getElementsByClassName('spicr-layer'))
}

function animateSliderLayers(slides,idx,next) {
  var activeItem = slides[idx] || slides[0],
      allLayers = getLayers(activeItem),
      isIn = activeItem.classList.contains('active'),
      nextItem = slides[next],
      nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0],
      nextData = nextBg ? getLayerData(nextBg) : 0;
  for ( var x in nextData ) {
    if ( /translate|rotate/.test(x) ){
      for ( var y in nextData[x] ){
        nextData[x][y] = -nextData[x][y];
      }
    }
  }
  if (nextData) {
    return allLayers.map(function (x){ return spicrConnect.layer(x,0,nextData); })
  } else {
    return allLayers.map(function (x){ return spicrConnect.layer(x,isIn?0:1); })
  }
}

var defaultInterval = 5000;

var defaultDelay = 250;

function Spicr( element, options ) {
  element = queryElement(element);
  options = options || {};
  var self = this, tws = self.tweens = [],
    pauseEvents = supportTouch && isMobile ? ['touchstart','touchend'] : mouseHoverEvents,
    intervalData = element.getAttribute('data-interval'),
    pauseData = element.getAttribute('data-pause'),
    pauseOption = options.pause === false || pauseData === 'false' ? false : 'hover',
    intervalOption = options.interval === false || parseInt(intervalData) === 0 || intervalData === 'false' ? 0
                    : typeof options.interval === 'number' ? options.interval
                    : isNaN(intervalData) ? defaultInterval
                    : parseInt(intervalData),
    slides = element.getElementsByClassName('item'),
    controls = element.querySelectorAll('[data-slide]'),
    leftArrow = controls.length && controls[0],
    rightArrow = controls.length && controls[1],
    pageNav  = element.getElementsByClassName('spicr-pages')[0],
    pages = pageNav && pageNav.querySelectorAll( "[data-slide-to]" ),
    timer = null,
    slideDirection = null,
    index = 0,
    isAnimating = 0,
    isSlider = element.classList.contains('spicr-slider'),
    isCarousel = element.classList.contains('spicr-carousel');
  function pauseHandler () {
    if ( !element.classList.contains('paused')) {
      element.classList.add('paused');
      !isAnimating && (clearInterval(timer),timer=null);
    }
  }
  function resumeHandler () {
    if ( element.classList.contains('paused') ) {
      element.classList.remove('paused');
      !isAnimating && (clearInterval(timer),timer=null);
      !isAnimating && self.cycle();
    }
  }
  function pageHandler (e) {
    e.preventDefault();
    if ( isAnimating ) { return }
    var eventTarget = e.target,
        nextIndex = eventTarget && eventTarget.getAttribute('data-slide-to');
    if ( eventTarget && !eventTarget.classList.contains('active') && nextIndex ) {
      index = parseInt( nextIndex );
      self.slideTo( index );
    }
    return false
  }
  function controlsHandler (e) {
    e.preventDefault();
    if ( isAnimating ) { return }
    var eventTarget = this;
    if ( eventTarget === rightArrow || rightArrow.contains(eventTarget) ) {
      index++;
    } else if ( eventTarget === leftArrow || leftArrow.contains(eventTarget) ) {
      index--;
    }
    self.slideTo( index );
  }
  function toggleEvents(action){
    action = action ? 'addEventListener' : 'removeEventListener';
    if ( pauseOption === 'hover' && intervalOption ) {
      element[action](pauseEvents[0], pauseHandler);
      element[action](pauseEvents[1], resumeHandler);
    }
    if (rightArrow) { rightArrow[action]( "click", controlsHandler); }
    if (leftArrow) { leftArrow[action]( "click", controlsHandler); }
    if (pageNav) { pageNav[action]("click", pageHandler); }
  }
  function setActivePage ( pageIndex ) {
    Array.from(pages).map(function (x){ return x.classList.remove('active'); });
    pageIndex && pageIndex.classList.add('active');
  }
  function beforeTween(current,next){
    index = next;
    slides[next].classList.add('next');
    isAnimating = true;
    if (isCarousel && current>-1 && slides[current].offsetHeight !== slides[next].offsetHeight) {
      element.style.height = getComputedStyle(slides[current]).height;
    }
  }
  function afterTween(activeIndex,nextItem) {
    slides[nextItem].classList.add('active');
    slides[nextItem].classList.remove('next');
    if (slides[activeIndex]) {
      slides[activeIndex].classList.remove('active');
    }
    setTimeout(function (){
      if (isCarousel) {
        element.style.height = '';
      }
      spicrConnect.reset(element);
      isAnimating = false;
      tws = [];
      if ( intervalOption && !element.classList.contains('paused') ) {
        self.cycle();
      }
    },0);
  }
  this.getActiveIndex = function () {
    var activeIndex = element.getElementsByClassName('item active')[0];
    return Array.from(slides).indexOf(activeIndex);
  };
  this.cycle = function() {
    clearInterval(timer);
    timer = setTimeout(function () {
      index++;
      self.slideTo( index );
    }, intervalOption);
  };
  this.slideTo = function( nextActive ) {
    var activeIndex = this.getActiveIndex();
    if (activeIndex === nextActive || isAnimating) { return; }
    clearInterval(timer);
    timer = setTimeout(function () {
      if ( (activeIndex < nextActive ) || (activeIndex === 0 && nextActive === slides.length -1 ) ) {
        slideDirection = 1;
      } else if  ( (activeIndex > nextActive) || (activeIndex === slides.length - 1 && nextActive === 0 ) ) {
        slideDirection = 0;
      }
      if ( nextActive < 0 ) { nextActive = slides.length - 1; }
      else if ( nextActive >= slides.length ){ nextActive = 0; }
      if ( isSlider ) {
        beforeTween(activeIndex,nextActive);
        var animateActiveLayers = activeIndex !== -1 ? animateSliderLayers(slides,activeIndex,nextActive) : animateSliderLayers(slides,activeIndex),
            animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides,nextActive);
        if (activeIndex === -1){
          animateActiveLayers.length && (tws = tws.concat(animateActiveLayers));
        } else {
          animateActiveLayers.length && (tws = tws.concat(animateActiveLayers));
          animateNextLayers.length && (tws = tws.concat(animateNextLayers));
        }
        if (tws.length) {
          tws.reduce(function (x,y){ return x._duration + x._delay > y._duration + y._delay ? x : y; } )
            ._onComplete = function () { return afterTween(activeIndex,nextActive); };
          tws.map(function (x){ return x.start(); });
        } else {
          afterTween(activeIndex,nextActive);
        }
        pages && setActivePage( pages[nextActive] );
      } else if ( isCarousel ) {
        beforeTween(activeIndex,nextActive);
        tws = spicrConnect.carousel(element,slides,activeIndex,nextActive,slideDirection);
        if (tws.length){
          tws[tws.length-1]._onComplete = function () { return afterTween(activeIndex,nextActive); };
          if ( slides[activeIndex] && slides[activeIndex].offsetHeight !== slides[nextActive].offsetHeight) {
            var easing = element.getAttribute('data-easing'),
                duration = element.getAttribute('data-duration');
            tws.push( spicrConnect.fromTo(element,
              { height: parseFloat(getComputedStyle(slides[activeIndex]).height) },
              { height: parseFloat(getComputedStyle(slides[nextActive]).height) },
              { easing: easing ? easing : defaultEasing,
                duration: !isNaN(duration) ? parseInt(duration) : defaultDuration,
                delay: defaultDelay}));
          }
          tws.map(function (x){ return x.start(); });
        } else {
          afterTween(activeIndex,nextActive);
        }
        pages && setActivePage( pages[nextActive] );
      }
    },1);
  };
  this.dispose = function(){
    isAnimating && tws.map(function (x){ return x.stop(); });
    spicrConnect.reset(element);
    toggleEvents();
    clearInterval( timer );
    delete element.Spicr;
  };
  element.Spicr && element.Spicr.dispose();
  toggleEvents(1);
  element.Spicr = self;
  if ( !element.getElementsByClassName('item active').length ) {
    self.slideTo(0);
  } else if (intervalOption){
    self.cycle();
  }
}

var KUTE = {};

var Tweens = [];

var globalObject = typeof (global) !== 'undefined' ? global
                  : typeof(self) !== 'undefined' ? self
                  : typeof(window) !== 'undefined' ? window : {};

var Interpolate = {};

var onStart = {};

var Time = {};
Time.now = self.performance.now.bind(self.performance);
var Tick = 0;
var Ticker = function (time) {
  var i = 0;
  while ( i < Tweens.length ) {
    if ( Tweens[i].update(time) ) {
      i++;
    } else {
      Tweens.splice(i, 1);
    }
  }
  Tick = requestAnimationFrame(Ticker);
};
function stop() {
  setTimeout(function () {
    if (!Tweens.length && Tick) {
      cancelAnimationFrame(Tick);
      Tick = null;
      for (var obj in onStart) {
        if (typeof (onStart[obj]) === 'function') {
          KUTE[obj] && (delete KUTE[obj]);
        } else {
          for (var prop in onStart[obj]) {
            KUTE[prop] && (delete KUTE[prop]);
          }
        }
      }
      for (var i in Interpolate) {
        KUTE[i] && (delete KUTE[i]);
      }
    }
  },64);
}
var Render = {Tick: Tick,Ticker: Ticker,Tweens: Tweens,Time: Time};
for ( var blob in Render ) {
  if (!KUTE[blob]) {
    KUTE[blob] = blob === 'Time' ? Time.now : Render[blob];
  }
}
globalObject["_KUTE"] = KUTE;

var defaultOptions = {
  duration: 700,
  delay: 0,
  easing: 'linear'
};

var linkProperty = {};

var onComplete = {};

var Objects = {
  defaultOptions: defaultOptions,
  linkProperty: linkProperty,
  onStart: onStart,
  onComplete: onComplete
};

var Util = {};

var connect = {};

var Easing = {
  linear : function (t) { return t; },
  easingSinusoidalIn : function (t) { return -Math.cos(t * Math.PI / 2) + 1; },
  easingSinusoidalOut : function (t) { return Math.sin(t * Math.PI / 2); },
  easingSinusoidalInOut : function (t) { return -0.5 * (Math.cos(Math.PI * t) - 1); },
  easingQuadraticIn : function (t) { return t*t; },
  easingQuadraticOut : function (t) { return t*(2-t); },
  easingQuadraticInOut : function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t; },
  easingCubicIn : function (t) { return t*t*t; },
  easingCubicOut : function (t) { return (--t)*t*t+1; },
  easingCubicInOut : function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
  easingQuarticIn : function (t) { return t*t*t*t; },
  easingQuarticOut : function (t) { return 1-(--t)*t*t*t; },
  easingQuarticInOut : function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
  easingQuinticIn : function (t) { return t*t*t*t*t; },
  easingQuinticOut : function (t) { return 1+(--t)*t*t*t*t; },
  easingQuinticInOut : function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; },
  easingCircularIn : function (t) { return -(Math.sqrt(1 - (t * t)) - 1); },
  easingCircularOut : function (t) { return Math.sqrt(1 - (t = t - 1) * t); },
  easingCircularInOut : function (t) { return ((t*=2) < 1) ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1); },
  easingExponentialIn : function (t) { return Math.pow( 2, (10 * (t - 1)) ) - 0.001; },
  easingExponentialOut : function (t) { return 1 - Math.pow( 2, (-10 * t) ); },
  easingExponentialInOut : function (t) { return (t *= 2) < 1 ? 0.5 * (Math.pow( 2, (10 * (t - 1)) )) : 0.5 * (2 - Math.pow( 2, (-10 * (t - 1)) )); },
  easingBackIn : function (t) { var s = 1.70158; return t * t * ((s + 1) * t - s) },
  easingBackOut : function (t) { var s = 1.70158; return --t * t * ((s + 1) * t + s) + 1 },
  easingBackInOut : function (t) {
    var s = 1.70158 * 1.525;
    if ((t *= 2) < 1) { return 0.5 * (t * t * ((s + 1) * t - s)) }
    return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2)
  },
  easingElasticIn : function (t) {
    var s, _kea = 0.1, _kep = 0.4;
    if ( t === 0 ) { return 0; }if ( t === 1 ) { return 1 }
    if ( !_kea || _kea < 1 ) { _kea = 1; s = _kep / 4; } else { s = _kep * Math.asin( 1 / _kea ) / Math.PI * 2; }
    return - ( _kea * (Math.pow( 2, (10 * (t -= 1)) )) * Math.sin( ( t - s ) * Math.PI * 2 / _kep ) )
  },
  easingElasticOut : function (t) {
    var s, _kea = 0.1, _kep = 0.4;
    if ( t === 0 ) { return 0; }if ( t === 1 ) { return 1 }
    if ( !_kea || _kea < 1 ) { _kea = 1; s = _kep / 4; } else { s = _kep * Math.asin( 1 / _kea ) / Math.PI * 2; }
    return _kea * (Math.pow( 2, (- 10 * t) )) * Math.sin( ( t - s ) * Math.PI * 2  / _kep ) + 1
  },
  easingElasticInOut : function (t) {
    var s, _kea = 0.1, _kep = 0.4;
    if ( t === 0 ) { return 0; }if ( t === 1 ) { return 1 }
    if ( !_kea || _kea < 1 ) { _kea = 1; s = _kep / 4; } else { s = _kep * Math.asin( 1 / _kea ) / Math.PI * 2; }
    if ( ( t *= 2 ) < 1 ) { return - 0.5 * ( _kea * (Math.pow( 2, (10 * (t -= 1)) )) * Math.sin( ( t - s ) * Math.PI * 2  / _kep ) ) }
    return _kea * (Math.pow( 2, (-10 * (t -= 1)) )) * Math.sin( ( t - s ) * Math.PI * 2  / _kep ) * 0.5 + 1
  },
  easingBounceIn : function (t) { return 1 - Easing.easingBounceOut( 1 - t ) },
  easingBounceOut : function (t) {
    if ( t < ( 1 / 2.75 ) ) { return 7.5625 * t * t; }
    else if ( t < ( 2 / 2.75 ) ) { return 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + 0.75; }
    else if ( t < ( 2.5 / 2.75 ) ) { return 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + 0.9375; }
    else {return 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + 0.984375; }
  },
  easingBounceInOut : function (t) {
    if ( t < 0.5 ) { return Easing.easingBounceIn( t * 2 ) * 0.5; }
    return Easing.easingBounceOut( t * 2 - 1 ) * 0.5 + 0.5
  }
};
function processEasing(fn) {
  if ( typeof fn === 'function') {
    return fn;
  } else if ( typeof Easing[fn] === 'function' ) {
    return Easing[fn];
  } else {
    return Easing.linear
  }
}
connect.processEasing = processEasing;

function add (tw) { return Tweens.push(tw); }

function remove (tw) {
  var i = Tweens.indexOf(tw);
  i !== -1 && Tweens.splice(i, 1);
}

function getAll () { return Tweens; }

function removeAll () { Tweens.length = 0; }

var supportedProperties = {};

function linkInterpolation() {
  var this$1 = this;
  var loop = function ( component ) {
    var componentLink = linkProperty[component];
    var componentProps = supportedProperties[component];
    for ( var fnObj in componentLink ) {
      if ( typeof(componentLink[fnObj]) === 'function'
          && Object.keys(this$1.valuesEnd).some(function (i) { return componentProps && componentProps.includes(i)
          || i=== 'attr' && Object.keys(this$1.valuesEnd[i]).some(function (j) { return componentProps && componentProps.includes(j); }); } ) )
      {
        !KUTE[fnObj] && (KUTE[fnObj] = componentLink[fnObj]);
      } else {
        for ( var prop in this$1.valuesEnd ) {
          for ( var i in this$1.valuesEnd[prop] ) {
            if ( typeof(componentLink[i]) === 'function' ) {
              !KUTE[i] && (KUTE[i] = componentLink[i]);
            } else {
              for (var j in componentLink[fnObj]){
                if (componentLink[i] && typeof(componentLink[i][j]) === 'function' ) {
                  !KUTE[j] && (KUTE[j] = componentLink[i][j]);
                }
              }
            }
          }
        }
      }
    }
  };
  for (var component in linkProperty)loop( component );
}

var Internals = {
  add: add,
  remove: remove,
  getAll: getAll,
  removeAll: removeAll,
  stop: stop,
  linkInterpolation: linkInterpolation
};

function selector(el, multi) {
  try{
    var requestedElem;
    if (multi){
      requestedElem = el instanceof HTMLCollection
                   || el instanceof NodeList
                   || el instanceof Array && el.every(function (x) { return x instanceof Element; })
                    ? el : document.querySelectorAll(el);
    } else {
      requestedElem = el instanceof Element
                   || el === window
                    ? el : document.querySelector(el);
    }
    return requestedElem;
  } catch(e){
    console.error(("KUTE.js - Element(s) not found: " + el + "."));
  }
}

var AnimationBase = function AnimationBase(Component){
  return this.setComponent(Component)
};
AnimationBase.prototype.setComponent = function setComponent (Component){
  var ComponentName = Component.component;
  var Functions = { onStart: onStart, onComplete: onComplete };
  var Category = Component.category;
  var Property = Component.property;
  supportedProperties[ComponentName] = Component.properties || Component.subProperties || Component.property;
  if (Component.defaultOptions) {
    for (var op in Component.defaultOptions) {
      defaultOptions[op] = Component.defaultOptions[op];
    }
  }
  if (Component.functions) {
    for (var fn in Functions) {
      if (fn in Component.functions) {
        if ( typeof (Component.functions[fn]) === 'function') {
          !Functions[fn][ComponentName] && (Functions[fn][ComponentName] = {});
          !Functions[fn][ComponentName][ Category||Property ] && (Functions[fn][ComponentName][ Category||Property ] = Component.functions[fn]);
        } else {
          for ( var ofn in Component.functions[fn] ){
            !Functions[fn][ComponentName] && (Functions[fn][ComponentName] = {});
            !Functions[fn][ComponentName][ofn] && (Functions[fn][ComponentName][ofn] = Component.functions[fn][ofn]);
          }
        }
      }
    }
  }
  if (Component.Interpolate) {
    for (var fn$1 in Component.Interpolate) {
      var compIntObj = Component.Interpolate[fn$1];
      if ( typeof(compIntObj) === 'function' && !Interpolate[fn$1] ) {
        Interpolate[fn$1] = compIntObj;
      } else {
        for ( var sfn in compIntObj ) {
          if ( typeof(compIntObj[sfn]) === 'function' && !Interpolate[fn$1] ) {
            Interpolate[fn$1] = compIntObj[sfn];
          }
        }
      }
    }
    linkProperty[ComponentName] = Component.Interpolate;
  }
  if (Component.Util) {
    for (var fn$2 in Component.Util){
      !Util[fn$2] && (Util[fn$2] = Component.Util[fn$2]);
    }
  }
  return {name:ComponentName}
};

var TweenBase = function TweenBase(targetElement, startObject, endObject, options){
  this.element = targetElement;
  this.playing = false;
  this._startTime = null;
  this._startFired = false;
  this.valuesEnd = endObject;
  this.valuesStart = startObject;
  options = options || {};
  this._resetStart = options.resetStart || 0;
  this._easing = typeof (options.easing) === 'function' ? options.easing : connect.processEasing(options.easing);
  this._duration = options.duration || defaultOptions.duration;
  this._delay = options.delay || defaultOptions.delay;
  for (var op in options) {
    var internalOption = "_" + op;
    if( !(internalOption in this ) ) { this[internalOption] = options[op]; }
  }
  var easingFnName = this._easing.name;
  if (!onStart[easingFnName]) {
    onStart[easingFnName] = function(prop){
      !KUTE[prop] && prop === this._easing.name && (KUTE[prop] = this._easing);
    };
  }
  return this;
};
TweenBase.prototype.start = function start (time) {
  add(this);
  this.playing = true;
  this._startTime = typeof time !== 'undefined' ? time : KUTE.Time();
  this._startTime += this._delay;
  if (!this._startFired) {
    if (this._onStart) {
      this._onStart.call(this);
    }
    for (var obj in onStart) {
      if (typeof (onStart[obj]) === 'function') {
        onStart[obj].call(this,obj);
      } else {
        for (var prop in onStart[obj]) {
          onStart[obj][prop].call(this,prop);
        }
      }
    }
    linkInterpolation.call(this);
    this._startFired = true;
  }
  !Tick && Ticker();
  return this;
};
TweenBase.prototype.stop = function stop () {
  if (this.playing) {
    remove(this);
    this.playing = false;
    if (this._onStop) {
      this._onStop.call(this);
    }
    this.close();
  }
  return this;
};
TweenBase.prototype.close = function close () {
  for (var component in onComplete){
    for (var toClose in onComplete[component]){
      onComplete[component][toClose].call(this,toClose);
    }
  }
  this._startFired = false;
  stop.call(this);
};
TweenBase.prototype.chain = function chain (args) {
  this._chain = [];
  this._chain = args.length ? args : this._chain.concat(args);
  return this;
};
TweenBase.prototype.stopChainedTweens = function stopChainedTweens () {
  this._chain && this._chain.length && this._chain.map(function (tw){ return tw.stop(); });
};
TweenBase.prototype.update = function update (time) {
  time = time !== undefined ? time : KUTE.Time();
  var elapsed, progress;
  if ( time < this._startTime && this.playing ) { return true; }
  elapsed = (time - this._startTime) / this._duration;
  elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;
  progress = this._easing(elapsed);
  for (var tweenProp in this.valuesEnd){
    KUTE[tweenProp](this.element,this.valuesStart[tweenProp],this.valuesEnd[tweenProp],progress);
  }
  if (this._onUpdate) {
    this._onUpdate.call(this);
  }
  if (elapsed === 1) {
    if (this._onComplete) {
      this._onComplete.call(this);
    }
    this.playing = false;
    this.close();
    if (this._chain !== undefined && this._chain.length){
      this._chain.map(function (tw){ return tw.start(); });
    }
    return false;
  }
  return true;
};
connect.tween = TweenBase;

function fromTo(element, startObject, endObject, optionsObj) {
  optionsObj = optionsObj || {};
  return new connect.tween(selector(element), startObject, endObject, optionsObj)
}

function perspective(a, b, u, v) {
  return ("perspective(" + (((a + (b - a) * v) * 1000 >> 0 ) / 1000) + u + ")")
}

function translate3d(a, b, u, v) {
  var translateArray = [];
  for (var ax=0; ax<3; ax++){
    translateArray[ax] = ( a[ax]||b[ax] ? ( (a[ax] + ( b[ax] - a[ax] ) * v ) * 1000 >> 0 ) / 1000 : 0 ) + u;
  }
  return ("translate3d(" + (translateArray.join(',')) + ")");
}

function rotate3d(a, b, u, v) {
  var rotateStr = '';
  rotateStr += a[0]||b[0] ? ("rotateX(" + (((a[0] + (b[0] - a[0]) * v) * 1000 >> 0 ) / 1000) + u + ")") : '';
  rotateStr += a[1]||b[1] ? ("rotateY(" + (((a[1] + (b[1] - a[1]) * v) * 1000 >> 0 ) / 1000) + u + ")") : '';
  rotateStr += a[2]||b[2] ? ("rotateZ(" + (((a[2] + (b[2] - a[2]) * v) * 1000 >> 0 ) / 1000) + u + ")") : '';
  return rotateStr
}

function translate(a, b, u, v) {
  var translateArray = [];
  translateArray[0] = ( a[0]===b[0] ? b[0] : ( (a[0] + ( b[0] - a[0] ) * v ) * 1000 >> 0 ) / 1000 ) + u;
  translateArray[1] = a[1]||b[1] ? (( a[1]===b[1] ? b[1] : ( (a[1] + ( b[1] - a[1] ) * v ) * 1000 >> 0 ) / 1000 ) + u) : '0';
  return ("translate(" + (translateArray.join(',')) + ")");
}

function rotate(a, b, u, v) {
  return ("rotate(" + (((a + (b - a) * v) * 1000 >> 0 ) / 1000) + u + ")")
}

function scale(a, b, v) {
  return ("scale(" + (((a + (b - a) * v) * 1000 >> 0 ) / 1000) + ")");
}

function skew(a, b, u, v) {
  var skewArray = [];
  skewArray[0] = ( a[0]===b[0] ? b[0] : ( (a[0] + ( b[0] - a[0] ) * v ) * 1000 >> 0 ) / 1000 ) + u;
  skewArray[1] = a[1]||b[1] ? (( a[1]===b[1] ? b[1] : ( (a[1] + ( b[1] - a[1] ) * v ) * 1000 >> 0 ) / 1000 ) + u) : '0';
  return ("skew(" + (skewArray.join(',')) + ")");
}

function onStartTransform(tweenProp){
  if (!KUTE[tweenProp] && this.valuesEnd[tweenProp]) {
    KUTE[tweenProp] = function (elem, a, b, v) {
      elem.style[tweenProp] =
          (a.perspective||b.perspective ? perspective(a.perspective,b.perspective,'px',v) : '')
        + (a.translate3d ? translate3d(a.translate3d,b.translate3d,'px',v):'')
        + (a.rotate3d ? rotate3d(a.rotate3d,b.rotate3d,'deg',v):'')
        + (a.skew ? skew(a.skew,b.skew,'deg',v):'')
        + (a.scale||b.scale ? scale(a.scale,b.scale,v):'');
    };
  }
}
var BaseTransform = {
  component: 'baseTransform',
  property: 'transform',
  functions: {onStart: onStartTransform},
  Interpolate: {
    perspective: perspective,
    translate3d: translate3d,
    rotate3d: rotate3d,
    translate: translate, rotate: rotate, scale: scale, skew: skew
  }
};

function numbers(a, b, v) {
  a = +a; b -= a; return a + b * v;
}

function onStartOpacity(tweenProp){
  if ( tweenProp in this.valuesEnd && !KUTE[tweenProp]) {
    KUTE[tweenProp] = function (elem, a, b, v) {
      elem.style[tweenProp] = ((numbers(a,b,v) * 1000)>>0)/1000;
    };
  }
}
var baseOpacity = {
  component: 'baseOpacity',
  property: 'opacity',
  Interpolate: {numbers: numbers},
  functions: {onStart: onStartOpacity}
};

function boxModelOnStart(tweenProp){
  if (tweenProp in this.valuesEnd && !KUTE[tweenProp]) {
    KUTE[tweenProp] = function (elem, a, b, v) {
      elem.style[tweenProp] = (v > 0.99 || v < 0.01 ? ((numbers(a,b,v)*10)>>0)/10 : (numbers(a,b,v) ) >> 0) + "px";
    };
  }
}
var baseBoxProps = ['top','left','width','height'];
var baseBoxOnStart = {};
baseBoxProps.map(function (x){ return baseBoxOnStart[x] = boxModelOnStart; });
var baseBoxModel = {
  component: 'baseBoxModel',
  category: 'boxModel',
  properties: baseBoxProps,
  Interpolate: {numbers: numbers},
  functions: {onStart: baseBoxOnStart}
};

spicrConnect.fromTo = fromTo;
var K = {
  Animation: AnimationBase,
  Components: {
    Transform : new AnimationBase(BaseTransform),
    Opacity : new AnimationBase(baseOpacity),
    BoxModel : new AnimationBase(baseBoxModel),
  },
  Tween: TweenBase,
  fromTo: fromTo,
  Objects: Objects,
  Easing: Easing,
  Util: Util,
  Render: Render,
  Interpolate: Interpolate,
  Internals: Internals,
  Selector: selector
};
for (var o in K) { Spicr[o] = K[o]; }

function carouselTFunctions(elem,items,active,next,direction) {
  var carouselTweens = [],
    data = getLayerData(elem),
    fromActive = {}, toActive = {},
    fromNext = {}, toNext = {},
    activeItem = items[active],
    activeLayers = activeItem && getLayers(activeItem),
    nextLayers = getLayers(items[next]),
    translate = data.translate,
    rotate = data.rotate,
    scale = data.scale,
    origin = elem.getAttribute('data-transform-origin'),
    opacity = data.opacity,
    duration = data.duration||defaultDuration,
    delay = data.delay||parseInt(duration)/2,
    easing = data.easing,
    optionsActive, optionsNext;
  if (opacity) {
    fromActive.opacity  = 1; toActive.opacity  = 0;
    fromNext.opacity    = 0; toNext.opacity    = 1;
  }
  if ( scale || translate || rotate) {
    fromActive.transform = {};
    toActive.transform = {};
    fromNext.transform = {};
    toNext.transform = {};
  }
  if ( scale ) {
    fromActive.transform.scale = 1; toActive.transform.scale = scale;
    fromNext.transform.scale = scale; toNext.transform.scale = 1;
  }
  if ( translate ) {
    fromActive.transform.translate3d = [0,0,0];
    toActive.transform.translate3d = [
      translate.x ? (direction?-translate.x:translate.x) : 0,
      translate.y ? (direction?-translate.y:translate.y) : 0,
      translate.z ? (direction?-translate.z:translate.z) : 0
    ];
    fromNext.transform.translate3d = [
      translate.x ? (direction?translate.x:-translate.x) : 0,
      translate.y ? (direction?translate.y:-translate.y) : 0,
      translate.z ? (direction?translate.z:-translate.z) : 0
    ];
    toNext.transform.translate3d = [0,0,0];
  }
  if ( rotate ) {
    fromActive.transform.rotate3d = [0,0,0];
    toActive.transform.rotate3d = [
      rotate.x ? (direction?-rotate.x:rotate.x) : 0,
      rotate.y ? (direction?-rotate.y:rotate.y) : 0,
      rotate.z ? (direction?-rotate.z:rotate.z) : 0
    ];
    fromNext.transform.rotate3d = [
      rotate.x ? (direction?rotate.x:-rotate.x) : 0,
      rotate.y ? (direction?rotate.y:-rotate.y) : 0,
      rotate.z ? (direction?rotate.z:-rotate.z) : 0
    ];
    toNext.transform.rotate3d = [0,0,0];
  }
  if (!opacity && !rotate && !translate && !scale){
    duration = 50;
    delay = 0;
  }
  optionsActive = optionsNext = { easing: easing, duration: duration };
  if (!direction) {
    activeLayers && activeLayers.reverse();
    nextLayers.reverse();
  }
  activeLayers && activeLayers.map(function (x,i){
    optionsActive.delay = defaultDelay*i;
    carouselTweens.push( spicrConnect.fromTo(x, fromActive, toActive, optionsActive ) );
    if (origin){
      var o = origin ? processLayerData(x,origin) : {};
      x.style.transformOrigin = ('x'in o?o.x+'px':'50%') + " " + ('y'in o?o.y+'px':'50%') + " " + ('z'in o?o.z+'px':'');
    }
  });
  nextLayers.map(function (x,i){
    optionsNext.delay = (delay+50)*i;
    carouselTweens.push( spicrConnect.fromTo(x, fromNext, toNext, optionsNext ) );
    if (origin){
      var o = origin ? processLayerData(x,origin) : {};
      x.style.transformOrigin = ('x'in o?o.x+'px':'50%') + " " + ('y'in o?o.y+'px':'50%') + " " + ('z'in o?o.z+'px':'');
    }
  });
  return carouselTweens
}

function layerTFunctions(elem,isInAnimation,nextData) {
  var data = nextData ? nextData : getLayerData(elem),
    isBg = elem.classList.contains('item-bg'),
    from = {}, to = {},
    translate = data.translate,
    rotate = data.rotate,
    scale = data.scale,
    opacity = data.opacity,
    origin = data.origin,
    duration = data.duration,
    delay = data.delay || (!isBg ? defaultDelay : 0),
    easing = data.easing,
    tweenOptions;
  easing = /InOut/.test(easing) || nextData ? easing : ( isInAnimation ? easing.replace('In','Out') : easing.replace('Out','In') );
  delay = isInAnimation ? delay : 0;
  duration = isInAnimation ? duration : !isBg ? duration*1.5 : duration;
  opacity = !isInAnimation && isBg && nextData ? 0 : opacity;
  if (opacity) {
    from.opacity = isInAnimation?0:1;
    to.opacity = isInAnimation?1:0;
  }
  if ( scale || translate || rotate) {
    from.transform = {};
    to.transform = {};
    if (origin){
      elem.style.transformOrigin = ('x' in origin?origin.x+'px':'50%') + " " + ('y' in origin?origin.y+'px':'50%') + " " + ('z' in origin?origin.z+'px':'');
    }
  }
  if ( scale ) {
    from.transform.scale = isInAnimation?scale:1;
    to.transform.scale = isInAnimation?1:scale;
  }
  if ( translate ) {
    var fromTranslateX = isInAnimation && translate.x ? translate.x : 0, toTranslateX = translate.x && !isInAnimation ? translate.x : 0,
        fromTranslateY = isInAnimation && translate.y ? translate.y : 0, toTranslateY = translate.y && !isInAnimation ? translate.y : 0,
        fromTranslateZ = isInAnimation && translate.z ? translate.z : 0, toTranslateZ = translate.z && !isInAnimation ? translate.z : 0;
    from.transform.translate3d = [fromTranslateX,fromTranslateY,fromTranslateZ];
    to.transform.translate3d = [toTranslateX,toTranslateY,toTranslateZ];
  }
  if ( rotate ) {
    var fromRotateX = isInAnimation && rotate.x ? rotate.x : 0, toRotateX = !isInAnimation && rotate.x ? rotate.x : 0,
        fromRotateY = isInAnimation && rotate.y ? rotate.y : 0, toRotateY = !isInAnimation && rotate.y ? rotate.y : 0,
        fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0, toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;
    from.transform.rotate3d = [fromRotateX,fromRotateY,fromRotateZ];
    to.transform.rotate3d = [toRotateX,toRotateY,toRotateZ];
  }
  if (!opacity && !rotate && !translate && !scale){
    duration = 50;
    delay = 0;
  }
  tweenOptions = { easing: easing, duration: duration, delay: delay };
  return spicrConnect.fromTo(elem, from, to, tweenOptions)
}

function resetAllLayers(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).map(function (x){
    x.style.opacity = '';
    x.style.transform = '';
    x.style.transformOrigin = '';
  });
}

spicrConnect.carousel = carouselTFunctions;
spicrConnect.layer = layerTFunctions;
spicrConnect.reset = resetAllLayers;

function initComponent(lookup) {
  lookup = lookup ? lookup : document;
  var Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
  Spicrs.map(function (x){ return new Spicr(x); });
}
Spicr.initComponent = initComponent;
document.body ? initComponent() : document.addEventListener('DOMContentLoaded', function initScrollWrapper(){
  initComponent();
  document.removeEventListener('DOMContentLoaded', initScrollWrapper);
});

export default Spicr;
