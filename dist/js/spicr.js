/*!
* Spicr v1.0.7-alpha1 (http://thednp.github.io/spicr)
* Copyright 2017-2021 © thednp
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

  var mouseHoverEvents = ('onmouseleave' in document) ? ['mouseenter', 'mouseleave'] : ['mouseover', 'mouseout'];

  var addEventListener = 'addEventListener';

  var removeEventListener = 'removeEventListener';

  var supportPassive = (function () {
    var result = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function get() {
          result = true;
          return result;
        },
      });
      document[addEventListener]('DOMContentLoaded', function wrap() {
        document[removeEventListener]('DOMContentLoaded', wrap, opts);
      }, opts);
    } catch (e) {
      throw Error('Passive events are not supported');
    }

    return result;
  })();

  // general event options

  var passiveHandler = supportPassive ? { passive: true } : false;

  function normalizeValue(value) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    if (!Number.isNaN(value)) {
      return +value;
    }

    if (value === '' || value === 'null') {
      return null;
    }

    // string / function / Element / Object
    return value;
  }

  function normalizeOptions(element, defaultOps, inputOps, ns) {
    var normalOps = {};
    var dataOps = {};
    var data = Object.assign({}, element.dataset);

    Object.keys(data)
      .forEach(function (k) {
        var key = k.includes(ns)
          ? k.replace(ns, '').replace(/[A-Z]/, function (match) { return match.toLowerCase(); })
          : k;

        dataOps[key] = normalizeValue(data[k]);
      });

    Object.keys(inputOps)
      .forEach(function (k) {
        inputOps[k] = normalizeValue(inputOps[k]);
      });

    Object.keys(defaultOps)
      .forEach(function (k) {
        if (k in inputOps) {
          normalOps[k] = inputOps[k];
        } else if (k in dataOps) {
          normalOps[k] = dataOps[k];
        } else {
          normalOps[k] = defaultOps[k];
        }
      });

    return normalOps;
  }

  var spicrConnect = {};

  // process array from data string
  function processLayerData(elem, attributeString, isOrigin) {
    var attributesArray = attributeString.trim().split(/[,|;]/);
    var obj = {};

    attributesArray.forEach(function (x) {
      var prop = x.split(/[:|=]/);
      var pName = prop[0];
      var pValue = prop[1];
      var offsetType = /y/i.test(pName) || /v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';

      if (isOrigin && /%/.test(pValue) && !/z/i.test(pName)) {
        obj[pName] = pValue;
      } else {
        obj[pName] = /%/.test(pValue)
          ? (parseFloat(pValue) * elem[offsetType]) / 100
          : parseFloat(pValue);
      }
    });

    return obj;
  }

  var defaultSpicrOptions = {
    delay: 250,
    duration: 500,
    easing: 'easingCubicOut',
    interval: 5000,
    touch: true,
    pause: 'hover',
  };

  function getAttributes(elem) {
    var obj = {};
    var attr = ['translate', 'rotate', 'scale',
      'transform-origin', 'opacity', 'duration', 'delay', 'easing'];

    attr.forEach(function (a) {
      var prop = a === 'transform-origin' ? 'origin' : a;
      obj[prop] = elem.getAttribute(("data-" + a));
    });
    return obj;
  }

  function getLayerData(elem) {
    var attr = getAttributes(elem);
    var translate = attr.translate;
    var rotate = attr.rotate;
    var origin = attr.origin;
    var opacity = attr.opacity;
    var easing = attr.easing;
    var scale = attr.scale;
    var duration = attr.duration;
    var delay = attr.delay;

    scale = parseFloat(scale);
    duration = +duration;
    delay = +delay;

    return {
      translate: translate ? processLayerData(elem, translate) : '',
      rotate: rotate ? processLayerData(elem, rotate) : '',
      origin: origin ? processLayerData(elem, origin, 1) : '',
      scale: !Number.isNaN(scale) ? scale : '',
      opacity: opacity !== 'false' ? 1 : 0,
      duration: !Number.isNaN(duration) ? duration : defaultSpicrOptions.duration,
      delay: !Number.isNaN(delay) ? delay : 0,
      easing: easing || defaultSpicrOptions.easing,
    };
  }

  function getLayers(elem) {
    return Array.from(elem.getElementsByClassName('spicr-layer'));
  }

  // function to animate slider item background
  function animateSliderLayers(slides, idx, next) {
    var activeItem = slides[idx] || slides[0];
    var allLayers = getLayers(activeItem);
    var isIn = activeItem.classList.contains('active');
    var nextItem = slides[next];
    var nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0];
    var nextData = nextBg ? getLayerData(nextBg) : 0;

    if (nextData) {
      Object.keys(nextData).forEach(function (x) {
        if (/translate|rotate/.test(x) && nextData[x] instanceof Object) {
          Object.keys(nextData[x]).forEach(function (y) {
            nextData[x][y] = -nextData[x][y];
          });
        }
      });
      return allLayers.map(function (x) { return spicrConnect.layer(x, 0, nextData); });
    }
    return allLayers.map(function (x) { return spicrConnect.layer(x, isIn ? 0 : 1); });
  }

  // SPICR DEFINITION
  // ================
  function Spicr(el, ops) {
    var this$1 = this;

    var element = queryElement(el);

    // set options
    var options = normalizeOptions(element, defaultSpicrOptions, (ops || {}));

    // internal bind
    var self = this;
    self.tweens = [];
    var tws = self.tweens;
    var vars = {};

    // SPICR UTILITIES
    var pauseEvents = mouseHoverEvents;
    if (supportTouch && isMobile) {
      pauseEvents = ['touchstart', 'touchend'];
    }

    // options
    var pauseOption = options.pause; // false / hover
    var touchOption = options.touch; // boolean

    var intervalOption = options.interval; // integer / false

    // child elements
    var slides = element.getElementsByClassName('item');

    // controls
    var controls = element.querySelectorAll('[data-slide]');
    var leftArrow = controls.length && controls[0];
    var rightArrow = controls.length && controls[1];

    // pages
    var pageNav = element.getElementsByClassName('spicr-pages')[0];
    var pages = pageNav && pageNav.querySelectorAll('[data-slide-to]');

    // internal variables and / or constants
    var timer = null;
    var slideDirection = null;
    var index = 0;
    var isAnimating = 0;

    // spicr type
    var isSlider = element.classList.contains('spicr-slider');
    var isCarousel = element.classList.contains('spicr-carousel');

    // event handlers
    function pauseHandler() {
      if (!element.classList.contains('paused')) {
        element.classList.add('paused');
        if (!isAnimating) { clearInterval(timer); timer = null; }
      }
    }
    function resumeHandler() {
      if (element.classList.contains('paused')) {
        element.classList.remove('paused');
        if (!isAnimating) {
          clearInterval(timer);
          timer = null;
          self.cycle();
        }
      }
    }
    function pageHandler(e) { // pages
      e.preventDefault();
      if (isAnimating) { return; }
      var eventTarget = e.target;
      var nextIndex = eventTarget && eventTarget.getAttribute('data-slide-to');

      if (eventTarget && !eventTarget.classList.contains('active') && nextIndex) {
        index = parseInt(nextIndex, 10);
        self.slideTo(index);
      }
    }
    function controlsHandler(e) { // left | right
      e.preventDefault();
      if (isAnimating) { return; }
      var eventTarget = this;

      if (eventTarget === rightArrow || rightArrow.contains(eventTarget)) {
        index += 1;
      } else if (eventTarget === leftArrow || leftArrow.contains(eventTarget)) {
        index -= 1;
      }
      self.slideTo(index);
    }
    // touch events
    function touchDownHandler(e) {
      if (vars.isTouch) { return; }

      vars.startX = e.changedTouches[0].pageX;

      if (element.contains(e.target)) {
        vars.isTouch = true;
        toggleTouchEvents(1);
      }
    }
    function touchMoveHandler(e) {
      if (!vars.isTouch) { return; }

      vars.currentX = e.changedTouches[0].pageX;

      // cancel touch if more than one changedTouches detected
      if (e.type === 'touchmove' && e.changedTouches.length > 1) {
        e.preventDefault();
      }
    }
    function touchEndHandler(e) {
      if (!vars.isTouch || isAnimating) { return; }

      vars.endX = vars.currentX || e.changedTouches[0].pageX;

      if (vars.isTouch) {
        if ((!element.contains(e.target) || !element.contains(e.relatedTarget))
            && Math.abs(vars.startX - vars.endX) < 75) {
          return;
        }
        if (vars.currentX < vars.startX) {
          index += 1;
        } else if (vars.currentX > vars.startX) {
          index -= 1;
        }
        vars.isTouch = false;
        self.slideTo(index);

        toggleTouchEvents(); // remove
      }
    }
    function toggleTouchEvents(add) {
      var action = add ? 'addEventListener' : 'removeEventListener';
      element[action]('touchmove', touchMoveHandler, passiveHandler);
      element[action]('touchend', touchEndHandler, passiveHandler);
    }
    // private methods
    function toggleEvents(add) {
      var action = add ? 'addEventListener' : 'removeEventListener';
      if (pauseOption === 'hover' && intervalOption) {
        element[action](pauseEvents[0], pauseHandler);
        element[action](pauseEvents[1], resumeHandler);
      }
      if (rightArrow) { rightArrow[action]('click', controlsHandler); }
      if (leftArrow) { leftArrow[action]('click', controlsHandler); }

      if (touchOption && slides.length > 1) { element[action]('touchstart', touchDownHandler, passiveHandler); }

      // pages
      if (pageNav) { pageNav[action]('click', pageHandler); }
    }
    function setActivePage(pageIndex) {
      Array.from(pages).map(function (x) { return x.classList.remove('active'); });
      if (pageIndex) { pageIndex.classList.add('active'); }
    }
    function beforeTween(current, next) {
      index = next;
      slides[next].classList.add('next');
      isAnimating = true;

      if (isCarousel && current > -1 && slides[current].offsetHeight !== slides[next].offsetHeight) {
        element.style.height = getComputedStyle(slides[current]).height;
      }
    }
    function afterTween(activeIndex, nextItem) {
      slides[nextItem].classList.add('active');
      slides[nextItem].classList.remove('next');

      if (slides[activeIndex]) {
        slides[activeIndex].classList.remove('active');
      }

      setTimeout(function () {
        if (isCarousel) {
          element.style.height = '';
        }
        spicrConnect.reset(element);
        isAnimating = false;
        tws = [];
        if (intervalOption && !element.classList.contains('paused')) {
          self.cycle();
        }
      }, 0);
    }

    // public methods
    this.getActiveIndex = function () {
      var activeIndex = element.getElementsByClassName('item active')[0];
      return Array.from(slides).indexOf(activeIndex);
    };
    this.cycle = function () {
      clearInterval(timer);
      timer = setTimeout(function () {
        index += 1;
        self.slideTo(index);
      }, intervalOption);
    };
    this.slideTo = function (nextIdx) {
      var nextActive = nextIdx;
      var activeIndex = this$1.getActiveIndex();

      if (activeIndex === nextActive || isAnimating) { return; }

      clearInterval(timer);
      timer = setTimeout(function () {
        // determine slideDirection first
        if ((activeIndex < nextActive) || (activeIndex === 0 && nextActive === slides.length - 1)) {
          slideDirection = 1; // left next
        } else if ((activeIndex > nextActive)
          || (activeIndex === slides.length - 1 && nextActive === 0)) {
          slideDirection = 0; // right prev
        }

        // find the right next index
        if (nextActive < 0) {
          nextActive = slides.length - 1;
        } else if (nextActive >= slides.length) {
          nextActive = 0;
        }

        // do slider work
        if (isSlider) {
          beforeTween(activeIndex, nextActive); // always before creating tween objects

          var animateActiveLayers = activeIndex !== -1
            ? animateSliderLayers(slides, activeIndex, nextActive)
            : animateSliderLayers(slides, activeIndex);

          var animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides, nextActive);

          if (activeIndex === -1) {
            if (animateActiveLayers.length) { tws = tws.concat(animateActiveLayers); }
          } else {
            if (animateActiveLayers.length) { tws = tws.concat(animateActiveLayers); }
            if (animateNextLayers.length) { tws = tws.concat(animateNextLayers); }
          }

          if (tws.length) {
            tws.reduce(function (x, y) { return (x._duration + x._delay > y._duration + y._delay ? x : y); })
              ._onComplete = function () { return afterTween(activeIndex, nextActive); };

            tws.forEach(function (x) { return x.start(); });
          } else {
            afterTween(activeIndex, nextActive);
          }

          if (pages) { setActivePage(pages[nextActive]); }
        // do carousel work
        } else if (isCarousel) {
          beforeTween(activeIndex, nextActive); // always before creating tween objects

          var delay = defaultSpicrOptions.delay;
          var duration = defaultSpicrOptions.duration;
          var easing = defaultSpicrOptions.easing;
          var currentSlide = slides[activeIndex];
          var nextSlide = slides[nextActive];

          tws = spicrConnect.carousel(element, slides, activeIndex, nextActive, slideDirection);

          if (tws.length) {
            if (currentSlide && currentSlide.offsetHeight !== nextSlide.offsetHeight) {
              tws.push(spicrConnect.fromTo(element,
                { height: parseFloat(getComputedStyle(currentSlide).height) },
                { height: parseFloat(getComputedStyle(nextSlide).height) },
                {
                  easing: easing,
                  duration: duration,
                  // delay: Math.max.apply(Math, tws.map((x) => x._delay + x._duration)) || delay,
                  delay: Math.max.apply(Math, tws.map(function (x) { return x._delay + x._duration; })) || delay,
                }));
            }
            tws[tws.length - 1]._onComplete = function () { return afterTween(activeIndex, nextActive); };

            tws.forEach(function (x) { return x.start(); });
          } else {
            afterTween(activeIndex, nextActive);
          }
          if (pages) { setActivePage(pages[nextActive]); }
        }
      }, 1);
    };
    this.dispose = function () {
      if (isAnimating) { tws.forEach(function (x) { return x.stop(); }); }
      spicrConnect.reset(element);
      vars = {};
      toggleEvents();
      clearInterval(timer);
      delete element.Spicr;
    };

    // remove previous init
    if (element.Spicr) { element.Spicr.dispose(); }

    // INIT
    // next/prev
    toggleEvents(1);
    element.Spicr = self;

    if (!element.getElementsByClassName('item active').length) {
      self.slideTo(0);
    } else if (intervalOption) {
      self.cycle();
    }
  }

  if (typeof window.KUTE !== 'undefined') {
    spicrConnect.fromTo = window.KUTE.fromTo;
  // } else if (typeof K !== 'undefined') {
  //   spicrConnect.fromTo = K.fromTo
  // } else if (typeof fromTo !== 'undefined') {
  //   spicrConnect.fromTo = fromTo
  } else {
    throw Error('Spicr requires KUTE.js ^2.0.10');
  }

  // tweenCarousel to work with KUTE.js transformFunctions component
  function carouselTF(elem, items, active, next, direction) {
    var carouselTweens = [];
    var data = getLayerData(elem);
    var fromActive = {};
    var toActive = {};
    var fromNext = {};
    var toNext = {};
    var activeItem = items[active];
    var activeLayers = activeItem && getLayers(activeItem);
    var nextLayers = getLayers(items[next]);
    var translate = data.translate;
    var rotate = data.rotate;
    var scale = data.scale;
    var origin = elem.getAttribute('data-transform-origin');
    var opacity = data.opacity; // opacity is optional | boolean
    var easing = data.easing;

    var duration = data.duration || defaultSpicrOptions.duration;
    var delay = data.delay || +duration / 2;

    if (opacity) {
      fromActive.opacity = 1;
      toActive.opacity = 0;
      fromNext.opacity = 0;
      toNext.opacity = 1;
    }

    if (scale || translate || rotate) {
      fromActive.transform = {};
      toActive.transform = {};
      fromNext.transform = {};
      toNext.transform = {};
    }

    if (scale) {
      fromActive.transform.scale = 1;
      toActive.transform.scale = scale;
      fromNext.transform.scale = scale;
      toNext.transform.scale = 1;
    }

    if (translate) {
      fromActive.transform.translate3d = [0, 0, 0];
      var translateX = 0;
      var translateY = 0;
      var translateZ = 0;
      if ('x' in translate) { translateX = direction ? -translate.x : translate.x; }
      if ('y' in translate) { translateY = direction ? -translate.y : translate.y; }
      if ('Z' in translate) { translateZ = direction ? -translate.z : translate.z; }
      toActive.transform.translate3d = [translateX, translateY, translateZ];
      var fromTX = 0;
      var fromTY = 0;
      var fromTZ = 0;
      if ('x' in translate) { fromTX = direction ? translate.x : -translate.x; }
      if ('y' in translate) { fromTY = direction ? translate.y : -translate.y; }
      if ('Z' in translate) { fromTZ = direction ? translate.z : -translate.z; }
      fromNext.transform.translate3d = [fromTX, fromTY, fromTZ];
      toNext.transform.translate3d = [0, 0, 0];
    }
    if (rotate) {
      fromActive.transform.rotate3d = [0, 0, 0];
      var rotX = 0;
      var rotY = 0;
      var rotZ = 0;
      if ('x' in rotate) { rotX = direction ? -rotate.x : rotate.x; }
      if ('y' in rotate) { rotY = direction ? -rotate.y : rotate.y; }
      if ('Z' in rotate) { rotZ = direction ? -rotate.z : rotate.z; }
      toActive.transform.rotate3d = [rotX, rotY, rotZ];
      var fromRX = 0;
      var fromRY = 0;
      var fromRZ = 0;
      if ('x' in rotate) { fromRX = direction ? rotate.x : -rotate.x; }
      if ('y' in rotate) { fromRY = direction ? rotate.y : -rotate.y; }
      if ('Z' in rotate) { fromRZ = direction ? rotate.z : -rotate.z; }
      fromNext.transform.rotate3d = [fromRX, fromRY, fromRZ];
      toNext.transform.rotate3d = [0, 0, 0];
    }

    if (!direction) {
      if (activeLayers) { activeLayers.reverse(); }
      nextLayers.reverse();
    }

    if (!opacity && !rotate && !translate && !scale) {
      duration = 50;
      delay = 0;
    }

    var optionsActive = { easing: easing, duration: duration };
    var optionsNext = optionsActive;

    if (activeLayers) {
      activeLayers.forEach(function (x, i) {
        optionsActive.delay = defaultSpicrOptions.delay * i;
        carouselTweens.push(spicrConnect.fromTo(x, fromActive, toActive, optionsActive));
        if (origin) {
          var o = processLayerData(x, origin);
          var originX = '50%';
          var originY = '50%';
          var originZ = 'z' in o ? (" " + (o.z) + "px") : '';

          if ('x' in o) {
            originX = /%/.test(o.x) ? o.x : ((o.x) + "px");
          }
          if ('y' in o) {
            originY = /%/.test(o.y) ? o.y : ((o.y) + "px");
          }
          x.style.transformOrigin = originX + " " + originY + originZ;
        }
      });
    }

    nextLayers.forEach(function (x, i) {
      optionsNext.delay = (delay + 50) * i;
      carouselTweens.push(spicrConnect.fromTo(x, fromNext, toNext, optionsNext));
      if (origin) {
        var o = processLayerData(x, origin);
        var originX = '50%';
        var originY = '50%';
        var originZ = 'z' in o ? (" " + (o.z) + "px") : '';

        if ('x' in o) {
          originX = /%/.test(o.x) ? o.x : ((o.x) + "px");
        }
        if ('y' in o) {
          originY = /%/.test(o.y) ? o.y : ((o.y) + "px");
        }
        x.style.transformOrigin = originX + " " + originY + originZ;
      }
    });

    return carouselTweens;
  }

  // tweenLayer to work with KUTE.js transformFunctions component
  function layerTF(elem, isInAnimation, nextData) {
    var data = nextData || getLayerData(elem);
    var isBg = elem.classList.contains('item-bg');
    var from = {};
    var to = {};
    var translate = data.translate;
    var rotate = data.rotate;
    var scale = data.scale;
    var origin = data.origin;
    var opacity = data.opacity;
    var duration = data.duration;
    var easing = data.easing;
    var delay = data.delay || (!isBg ? defaultSpicrOptions.delay : 0);

    if (!/InOut/.test(easing) && !nextData) {
      easing = isInAnimation ? easing.replace('In', 'Out') : easing.replace('Out', 'In');
    }
    if (!isInAnimation) {
      duration = !isBg ? duration * 1.5 : duration;
    }

    delay = isInAnimation ? delay : 0;
    opacity = !isInAnimation && isBg && nextData ? 0 : opacity;

    if (opacity) {
      from.opacity = isInAnimation ? 0 : 1;
      to.opacity = isInAnimation ? 1 : 0;
    }

    if (scale || translate || rotate) {
      from.transform = {};
      to.transform = {};
      if (origin) { // origin axis can be 0
        var originX = '50%';
        var originY = '50%';
        var originZ = 'z' in origin ? (" " + (origin.z) + "px") : '';

        if ('x' in origin) {
          originX = /%/.test(origin.x) ? origin.x : ((origin.x) + "px");
        }
        if ('y' in origin) {
          originY = /%/.test(origin.y) ? origin.y : ((origin.y) + "px");
        }

        elem.style.transformOrigin = originX + " " + originY + originZ;
      }
    }

    if (scale) {
      from.transform.scale = isInAnimation ? scale : 1;
      to.transform.scale = isInAnimation ? 1 : scale;
    }
    if (translate) {
      var fromTranslateX = isInAnimation && translate.x ? translate.x : 0;
      var toTranslateX = translate.x && !isInAnimation ? translate.x : 0;
      var fromTranslateY = isInAnimation && translate.y ? translate.y : 0;
      var toTranslateY = translate.y && !isInAnimation ? translate.y : 0;
      var fromTranslateZ = isInAnimation && translate.z ? translate.z : 0;
      var toTranslateZ = translate.z && !isInAnimation ? translate.z : 0; // not supported on IE9-

      from.transform.translate3d = [fromTranslateX, fromTranslateY, fromTranslateZ];
      to.transform.translate3d = [toTranslateX, toTranslateY, toTranslateZ];
    }
    if (rotate) {
      var fromRotateX = isInAnimation && rotate.x ? rotate.x : 0;
      var toRotateX = !isInAnimation && rotate.x ? rotate.x : 0;
      var fromRotateY = isInAnimation && rotate.y ? rotate.y : 0;
      var toRotateY = !isInAnimation && rotate.y ? rotate.y : 0;
      var fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0;
      var toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;

      from.transform.rotate3d = [fromRotateX, fromRotateY, fromRotateZ];
      to.transform.rotate3d = [toRotateX, toRotateY, toRotateZ];
    }
    if (!opacity && !rotate && !translate && !scale) {
      duration = 50;
      delay = 0;
    }

    return spicrConnect.fromTo(elem, from, to, { easing: easing, duration: duration, delay: delay });
  }

  function resetAllLayers(element) {
    Array.from(element.getElementsByClassName('spicr-layer')).forEach(function (x) {
      x.style.opacity = '';
      x.style.transform = '';
      x.style.transformOrigin = '';
    });
  }

  spicrConnect.carousel = carouselTF;
  spicrConnect.layer = layerTF;
  spicrConnect.reset = resetAllLayers;

  // DATA API
  function initComponent(input) {
    var lookup = input instanceof Element ? input : document;
    var Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
    Spicrs.forEach(function (x) { return new Spicr(x); });
  }

  // export to "global"
  Spicr.initComponent = initComponent;

  // initialize when loaded
  if (document.body) {
    initComponent();
  } else {
    document.addEventListener('DOMContentLoaded', initComponent, { once: true });
  }

  return Spicr;

})));
