/*!
* Spicr v1.0.0 (http://thednp.github.io/spicr)
* Copyright 2017-2020 © thednp
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Spicr = factory());
}(this, (function () { 'use strict';

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

  function animateBackgrounds(slides,idx,next) {
    var activeItem = slides[idx] || slides[0],
        nextItem = slides[next],
        result = [],
        bg = activeItem.getElementsByClassName('item-bg')[0],
        nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0],
        nextData = nextBg && getLayerData(nextBg);
    for ( var x in nextData ) {
      if ( /translate|rotate/.test(x) ){
        for ( var y in nextData[x] ){
          nextData[x][y] = -nextData[x][y];
        }
      } else if (x==='opacity'){
        nextData[x] = 0;
      }
    }
    if (idx === -1){
      bg && result.push( spicrConnect.layer(bg,1) );
    } else {
      bg && result.push( spicrConnect.layer(bg,0,nextData) );
      nextBg && result.push( spicrConnect.layer(nextBg,1) );
    }
    return result;
  }

  function getLayers(elem) {
    var result = [],
        all = elem.getElementsByClassName('spicr-layer'),
        background = elem.getElementsByClassName('item-bg')[0];
    Array.from(all).map(function (x){ return x!==background && result.push(x); });
    return result;
  }

  function animateSliderLayers(elem) {
    var allLayers = getLayers(elem), result = [],
        isIn = !elem.classList.contains('active');
    allLayers.map(function (x){
      result.push(spicrConnect.layer(x,isIn));
    });
    return result
  }

  var defaultInterval = 5000;

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
      index = null,
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
    function beforeTween(next){
      index = next;
      slides[next].classList.add('next');
      isAnimating = true;
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
          beforeTween(nextActive);
          var animateBg = activeIndex !== -1 ? animateBackgrounds(slides,activeIndex,nextActive) : animateBackgrounds(slides,activeIndex),
              animateActiveLayers = activeIndex !== -1 ? animateSliderLayers(slides[activeIndex]) : animateSliderLayers(slides[0]),
              animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides[nextActive]),
              lastTweens = [];
          if (activeIndex === -1){
            if (animateBg.length) {
              lastTweens = animateBg;
              tws = tws.concat( animateBg );
              if (animateActiveLayers.length) {
                lastTweens = animateActiveLayers;
                animateBg[animateBg.length - 1].chain( animateActiveLayers );
              }
            }
            if (lastTweens.length) {
              lastTweens[lastTweens.length - 1]._onComplete = function (){ return afterTween(activeIndex,nextActive); };
            }
            tws.length && tws[0].start();
          } else {
            if (animateActiveLayers.length){
              tws = tws.concat(animateActiveLayers);
              lastTweens = animateActiveLayers;
            }
            if (animateBg.length){
              tws = tws.concat(animateBg);
              lastTweens.length && lastTweens[lastTweens.length - 1].chain(animateBg);
              lastTweens = animateBg;
            }
            if (animateNextLayers.length){
              tws = tws.concat(animateNextLayers);
              lastTweens.length && lastTweens[lastTweens.length - 1].chain(animateNextLayers);
              lastTweens = animateNextLayers;
            }
            if (lastTweens.length) {
              lastTweens[lastTweens.length - 1]._onComplete = function (){ return afterTween(activeIndex,nextActive); };
            }
            animateActiveLayers.length ? animateActiveLayers.map(function (x){ return x.start(); })
                                       : animateBg.length ? animatetBg.map(function (x){ return x.start(); })
                                       : animateNextLayers.length ? animateNextLayers.map(function (x){ return x.start(); }) : 0;
          }
          pages && setActivePage( pages[nextActive] );
          if (!lastTweens.length) {
            afterTween(activeIndex,nextActive);
          }
        } else if ( isCarousel ) {
          beforeTween(nextActive);
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
                  duration: !isNaN(duration) ? parseInt(duration) : defaultDuration}));
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

  var defaultDelay = 150;

  function carouselTFunctions(elem,items,active,next,direction) {
    var carouselTweens = [],
      data = getLayerData(elem),
      fromActive = {}, toActive = {},
      fromNext = {}, toNext = {},
      activeLayers = items[active] && getLayers(items[active]),
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
      from = {}, to = {},
      translate = data.translate,
      rotate = data.rotate,
      scale = data.scale,
      opacity = data.opacity,
      origin = data.origin,
      duration = data.duration,
      delay = data.delay,
      easing = data.easing,
      tweenOptions;
    easing = /InOut/.test(easing) || nextData ? easing : ( isInAnimation ? easing.replace('In','Out') : easing.replace('Out','In') );
    delay = isInAnimation ? delay : 0;
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

  return Spicr;

})));
