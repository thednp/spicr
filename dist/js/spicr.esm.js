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

function processLayerData(elem,attributeString,isOrigin){
  var attributesArray = attributeString.trim().split(/[,|;]/), obj = {};
  attributesArray.map(function (x){
    var prop = x.split(/[:|=]/), pName = prop[0], pValue = prop[1],
    offsetType = /y/i.test(pName)||/v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';
    obj[pName] = isOrigin && /%/.test(pValue) && !/z/i.test(pName) ? pValue
               : /%/.test(pValue) ? parseFloat(pValue)*elem[offsetType]/100 : parseFloat(pValue);
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
    origin    : origin            ? processLayerData(elem,origin,1) : '',
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

if (typeof KUTE !== 'undefined') {
  spicrConnect.fromTo = KUTE.fromTo;
} else {
  throw Error('Spicr requires KUTE.js ^2.0.10')
}

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
      var o = processLayerData(x,origin),
          originX = 'x' in o ? (/%/.test(o.x) ? o.x : o.x + 'px') : '50%',
          originY = 'y' in o ? (/%/.test(o.y) ? o.y : o.y + 'px') : '50%',
          originZ = 'z' in o ? o.z + 'px' : '';
      x.style.transformOrigin = originX + " " + originY + " " + originZ;
    }
  });
  nextLayers.map(function (x,i){
    optionsNext.delay = (delay+50)*i;
    carouselTweens.push( spicrConnect.fromTo(x, fromNext, toNext, optionsNext ) );
    if (origin){
      var o = processLayerData(x,origin),
          originX = 'x' in o ? (/%/.test(o.x) ? o.x : o.x + 'px') : '50%',
          originY = 'y' in o ? (/%/.test(o.y) ? o.y : o.y + 'px') : '50%',
          originZ = 'z' in o ? o.z + 'px' : '';
      x.style.transformOrigin = originX + " " + originY + " " + originZ;
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
    if (origin) {
      var originX = 'x' in origin ? (/%/.test(origin.x) ? origin.x : origin.x + 'px') : '50%',
          originY = 'y' in origin ? (/%/.test(origin.y) ? origin.y : origin.y + 'px') : '50%',
          originZ = 'z' in origin ? origin.z + 'px' : '';
      elem.style.transformOrigin = originX + " " + originY + " " + originZ;
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
