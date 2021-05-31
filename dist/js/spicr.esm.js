/*!
* Spicr v1.0.8 (http://thednp.github.io/spicr)
* Copyright 2017-2021 © thednp
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/
function queryElement(selector, parent) {
  const lookUp = parent && parent instanceof Element ? parent : document;
  return selector instanceof Element ? selector : lookUp.querySelector(selector);
}

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const supportTouch = ('ontouchstart' in window || navigator.msMaxTouchPoints) || false;

const mouseHoverEvents = ('onmouseleave' in document) ? ['mouseenter', 'mouseleave'] : ['mouseover', 'mouseout'];

const addEventListener = 'addEventListener';

const removeEventListener = 'removeEventListener';

const supportPassive = (() => {
  let result = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
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

  if (!Number.isNaN(+value)) {
    return +value;
  }

  if (value === '' || value === 'null') {
    return null;
  }

  // string / function / Element / Object
  return value;
}

function normalizeOptions(element, defaultOps, inputOps, ns) {
  const normalOps = {};
  const dataOps = {};
  const data = { ...element.dataset };

  Object.keys(data)
    .forEach((k) => {
      const key = k.includes(ns)
        ? k.replace(ns, '').replace(/[A-Z]/, (match) => match.toLowerCase())
        : k;

      dataOps[key] = normalizeValue(data[k]);
    });

  Object.keys(inputOps)
    .forEach((k) => {
      inputOps[k] = normalizeValue(inputOps[k]);
    });

  Object.keys(defaultOps)
    .forEach((k) => {
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
  const attributesArray = attributeString.trim().split(/[,|;]/);
  const obj = {};

  attributesArray.forEach((x) => {
    const prop = x.split(/[:|=]/);
    const pName = prop[0];
    const pValue = prop[1];
    const offsetType = /y/i.test(pName) || /v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';

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

const defaultSpicrOptions = {
  delay: 250,
  duration: 500,
  easing: 'easingCubicOut',
  interval: 5000,
  touch: true,
  pause: 'hover',
};

function getAttributes(elem) {
  const obj = {};
  const attr = ['translate', 'rotate', 'scale',
    'transform-origin', 'opacity', 'duration', 'delay', 'easing'];

  attr.forEach((a) => {
    const prop = a === 'transform-origin' ? 'origin' : a;
    obj[prop] = elem.getAttribute(`data-${a}`);
  });
  return obj;
}

function getLayerData(elem) {
  const attr = getAttributes(elem);
  const {
    translate, rotate, origin, opacity, easing,
  } = attr;
  let { scale, duration, delay } = attr;

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
  const activeItem = slides[idx] || slides[0];
  const allLayers = getLayers(activeItem);
  const isIn = activeItem.classList.contains('active');
  const nextItem = slides[next];
  const nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0];
  const nextData = nextBg ? getLayerData(nextBg) : 0;

  if (nextData) {
    Object.keys(nextData).forEach((x) => {
      if (/translate|rotate/.test(x) && nextData[x] instanceof Object) {
        Object.keys(nextData[x]).forEach((y) => {
          nextData[x][y] = -nextData[x][y];
        });
      }
    });
    return allLayers.map((x) => spicrConnect.layer(x, 0, nextData));
  }
  return allLayers.map((x) => spicrConnect.layer(x, isIn ? 0 : 1));
}

// SPICR DEFINITION
// ================
function Spicr(el, ops) {
  const element = queryElement(el);

  // set options
  const options = normalizeOptions(element, defaultSpicrOptions, (ops || {}));

  // internal bind
  const self = this;
  self.tweens = [];
  let tws = self.tweens;
  let vars = {};

  // SPICR UTILITIES
  let pauseEvents = mouseHoverEvents;
  if (supportTouch && isMobile) {
    pauseEvents = ['touchstart', 'touchend'];
  }

  // options
  const pauseOption = options.pause; // false / hover
  const touchOption = options.touch; // boolean

  const intervalOption = options.interval; // integer / false

  // child elements
  const slides = element.getElementsByClassName('item');

  // controls
  const controls = element.querySelectorAll('[data-slide]');
  const leftArrow = controls.length && controls[0];
  const rightArrow = controls.length && controls[1];

  // pages
  const pageNav = element.getElementsByClassName('spicr-pages')[0];
  const pages = pageNav && pageNav.querySelectorAll('[data-slide-to]');

  // internal variables and / or constants
  let timer = null;
  let slideDirection = null;
  let index = 0;
  let isAnimating = 0;

  // spicr type
  const isSlider = element.classList.contains('spicr-slider');
  const isCarousel = element.classList.contains('spicr-carousel');

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
    const eventTarget = e.target;
    const nextIndex = eventTarget && eventTarget.getAttribute('data-slide-to');

    if (eventTarget && !eventTarget.classList.contains('active') && nextIndex) {
      index = parseInt(nextIndex, 10);
      self.slideTo(index);
    }
  }
  function controlsHandler(e) { // left | right
    e.preventDefault();
    if (isAnimating) { return; }
    const eventTarget = this;

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
    const action = add ? 'addEventListener' : 'removeEventListener';
    element[action]('touchmove', touchMoveHandler, passiveHandler);
    element[action]('touchend', touchEndHandler, passiveHandler);
  }
  // private methods
  function toggleEvents(add) {
    const action = add ? 'addEventListener' : 'removeEventListener';
    if (pauseOption === 'hover' && intervalOption) {
      element[action](pauseEvents[0], pauseHandler);
      element[action](pauseEvents[1], resumeHandler);
    }
    if (rightArrow) { rightArrow[action]('click', controlsHandler); }
    if (leftArrow) { leftArrow[action]('click', controlsHandler); }

    if (touchOption && slides.length > 1) element[action]('touchstart', touchDownHandler, passiveHandler);

    // pages
    if (pageNav) { pageNav[action]('click', pageHandler); }
  }
  function setActivePage(pageIndex) {
    Array.from(pages).map((x) => x.classList.remove('active'));
    if (pageIndex) pageIndex.classList.add('active');
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

    setTimeout(() => {
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
  this.getActiveIndex = () => {
    const activeIndex = element.getElementsByClassName('item active')[0];
    return Array.from(slides).indexOf(activeIndex);
  };
  this.cycle = () => {
    clearInterval(timer);
    timer = setTimeout(() => {
      index += 1;
      self.slideTo(index);
    }, intervalOption);
  };
  this.slideTo = (nextIdx) => {
    let nextActive = nextIdx;
    const activeIndex = this.getActiveIndex();

    if (activeIndex === nextActive || isAnimating) return;

    clearInterval(timer);
    timer = setTimeout(() => {
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

        const animateActiveLayers = activeIndex !== -1
          ? animateSliderLayers(slides, activeIndex, nextActive)
          : animateSliderLayers(slides, activeIndex);

        const animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides, nextActive);

        if (activeIndex === -1) {
          if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
        } else {
          if (animateActiveLayers.length) tws = tws.concat(animateActiveLayers);
          if (animateNextLayers.length) tws = tws.concat(animateNextLayers);
        }

        if (tws.length) {
          tws.reduce((x, y) => (x._duration + x._delay > y._duration + y._delay ? x : y))
            ._onComplete = () => afterTween(activeIndex, nextActive);

          tws.forEach((x) => x.start());
        } else {
          afterTween(activeIndex, nextActive);
        }

        if (pages) setActivePage(pages[nextActive]);
      // do carousel work
      } else if (isCarousel) {
        beforeTween(activeIndex, nextActive); // always before creating tween objects

        const { delay, duration, easing } = defaultSpicrOptions;
        const currentSlide = slides[activeIndex];
        const nextSlide = slides[nextActive];

        tws = spicrConnect.carousel(element, slides, activeIndex, nextActive, slideDirection);

        if (tws.length) {
          if (currentSlide && currentSlide.offsetHeight !== nextSlide.offsetHeight) {
            tws.push(spicrConnect.fromTo(element,
              { height: parseFloat(getComputedStyle(currentSlide).height) },
              { height: parseFloat(getComputedStyle(nextSlide).height) },
              {
                easing,
                duration,
                // delay: Math.max.apply(Math, tws.map((x) => x._delay + x._duration)) || delay,
                delay: Math.max(...tws.map((x) => x._delay + x._duration)) || delay,
              }));
          }
          tws[tws.length - 1]._onComplete = () => afterTween(activeIndex, nextActive);

          tws.forEach((x) => x.start());
        } else {
          afterTween(activeIndex, nextActive);
        }
        if (pages) setActivePage(pages[nextActive]);
      }
    }, 1);
  };
  this.dispose = () => {
    if (isAnimating) tws.forEach((x) => x.stop());
    spicrConnect.reset(element);
    vars = {};
    toggleEvents();
    clearInterval(timer);
    delete element.Spicr;
  };

  // remove previous init
  if (element.Spicr) element.Spicr.dispose();

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
  const carouselTweens = [];
  const data = getLayerData(elem);
  const fromActive = {};
  const toActive = {};
  const fromNext = {};
  const toNext = {};
  const activeItem = items[active];
  const activeLayers = activeItem && getLayers(activeItem);
  const nextLayers = getLayers(items[next]);
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  const origin = elem.getAttribute('data-transform-origin');
  const { opacity } = data; // opacity is optional | boolean
  const { easing } = data;

  let duration = data.duration || defaultSpicrOptions.duration;
  let delay = data.delay || +duration / 2;

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
    let translateX = 0;
    let translateY = 0;
    let translateZ = 0;
    if ('x' in translate) translateX = direction ? -translate.x : translate.x;
    if ('y' in translate) translateY = direction ? -translate.y : translate.y;
    if ('Z' in translate) translateZ = direction ? -translate.z : translate.z;
    toActive.transform.translate3d = [translateX, translateY, translateZ];
    let fromTX = 0;
    let fromTY = 0;
    let fromTZ = 0;
    if ('x' in translate) fromTX = direction ? translate.x : -translate.x;
    if ('y' in translate) fromTY = direction ? translate.y : -translate.y;
    if ('Z' in translate) fromTZ = direction ? translate.z : -translate.z;
    fromNext.transform.translate3d = [fromTX, fromTY, fromTZ];
    toNext.transform.translate3d = [0, 0, 0];
  }
  if (rotate) {
    fromActive.transform.rotate3d = [0, 0, 0];
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    if ('x' in rotate) rotX = direction ? -rotate.x : rotate.x;
    if ('y' in rotate) rotY = direction ? -rotate.y : rotate.y;
    if ('Z' in rotate) rotZ = direction ? -rotate.z : rotate.z;
    toActive.transform.rotate3d = [rotX, rotY, rotZ];
    let fromRX = 0;
    let fromRY = 0;
    let fromRZ = 0;
    if ('x' in rotate) fromRX = direction ? rotate.x : -rotate.x;
    if ('y' in rotate) fromRY = direction ? rotate.y : -rotate.y;
    if ('Z' in rotate) fromRZ = direction ? rotate.z : -rotate.z;
    fromNext.transform.rotate3d = [fromRX, fromRY, fromRZ];
    toNext.transform.rotate3d = [0, 0, 0];
  }

  if (!direction) {
    if (activeLayers) activeLayers.reverse();
    nextLayers.reverse();
  }

  if (!opacity && !rotate && !translate && !scale) {
    duration = 50;
    delay = 0;
  }

  const optionsActive = { easing, duration };
  const optionsNext = optionsActive;

  if (activeLayers) {
    activeLayers.forEach((x, i) => {
      optionsActive.delay = defaultSpicrOptions.delay * i;
      carouselTweens.push(spicrConnect.fromTo(x, fromActive, toActive, optionsActive));
      if (origin) {
        const o = processLayerData(x, origin);
        let originX = '50%';
        let originY = '50%';
        const originZ = 'z' in o ? ` ${o.z}px` : '';

        if ('x' in o) {
          originX = /%/.test(o.x) ? o.x : `${o.x}px`;
        }
        if ('y' in o) {
          originY = /%/.test(o.y) ? o.y : `${o.y}px`;
        }
        x.style.transformOrigin = `${originX} ${originY}${originZ}`;
      }
    });
  }

  nextLayers.forEach((x, i) => {
    optionsNext.delay = (delay + 50) * i;
    carouselTweens.push(spicrConnect.fromTo(x, fromNext, toNext, optionsNext));
    if (origin) {
      const o = processLayerData(x, origin);
      let originX = '50%';
      let originY = '50%';
      const originZ = 'z' in o ? ` ${o.z}px` : '';

      if ('x' in o) {
        originX = /%/.test(o.x) ? o.x : `${o.x}px`;
      }
      if ('y' in o) {
        originY = /%/.test(o.y) ? o.y : `${o.y}px`;
      }
      x.style.transformOrigin = `${originX} ${originY}${originZ}`;
    }
  });

  return carouselTweens;
}

// tweenLayer to work with KUTE.js transformFunctions component
function layerTF(elem, isInAnimation, nextData) {
  const data = nextData || getLayerData(elem);
  const isBg = elem.classList.contains('item-bg');
  const from = {};
  const to = {};
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  const { origin } = data;
  let { opacity } = data;
  let { duration } = data;
  let { easing } = data;
  let delay = data.delay || (!isBg ? defaultSpicrOptions.delay : 0);

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
      let originX = '50%';
      let originY = '50%';
      const originZ = 'z' in origin ? ` ${origin.z}px` : '';

      if ('x' in origin) {
        originX = /%/.test(origin.x) ? origin.x : `${origin.x}px`;
      }
      if ('y' in origin) {
        originY = /%/.test(origin.y) ? origin.y : `${origin.y}px`;
      }

      elem.style.transformOrigin = `${originX} ${originY}${originZ}`;
    }
  }

  if (scale) {
    from.transform.scale = isInAnimation ? scale : 1;
    to.transform.scale = isInAnimation ? 1 : scale;
  }
  if (translate) {
    const fromTranslateX = isInAnimation && translate.x ? translate.x : 0;
    const toTranslateX = translate.x && !isInAnimation ? translate.x : 0;
    const fromTranslateY = isInAnimation && translate.y ? translate.y : 0;
    const toTranslateY = translate.y && !isInAnimation ? translate.y : 0;
    const fromTranslateZ = isInAnimation && translate.z ? translate.z : 0;
    const toTranslateZ = translate.z && !isInAnimation ? translate.z : 0; // not supported on IE9-

    from.transform.translate3d = [fromTranslateX, fromTranslateY, fromTranslateZ];
    to.transform.translate3d = [toTranslateX, toTranslateY, toTranslateZ];
  }
  if (rotate) {
    const fromRotateX = isInAnimation && rotate.x ? rotate.x : 0;
    const toRotateX = !isInAnimation && rotate.x ? rotate.x : 0;
    const fromRotateY = isInAnimation && rotate.y ? rotate.y : 0;
    const toRotateY = !isInAnimation && rotate.y ? rotate.y : 0;
    const fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0;
    const toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;

    from.transform.rotate3d = [fromRotateX, fromRotateY, fromRotateZ];
    to.transform.rotate3d = [toRotateX, toRotateY, toRotateZ];
  }
  if (!opacity && !rotate && !translate && !scale) {
    duration = 50;
    delay = 0;
  }

  return spicrConnect.fromTo(elem, from, to, { easing, duration, delay });
}

function resetAllLayers(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
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
  const lookup = input instanceof Element ? input : document;
  const Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
  Spicrs.forEach((x) => new Spicr(x));
}

// export to "global"
Spicr.initComponent = initComponent;

// initialize when loaded
if (document.body) {
  initComponent();
} else {
  document.addEventListener('DOMContentLoaded', initComponent, { once: true });
}

export default Spicr;
