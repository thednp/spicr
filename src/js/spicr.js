import queryElement from 'shorter-js/src/misc/queryElement.js';
import isMobile from 'shorter-js/src/boolean/isMobile.js';
import supportTouch from 'shorter-js/src/boolean/supportTouch.js';
import mouseHoverEvents from 'shorter-js/src/strings/mouseHoverEvents.js';
import passiveHandler from 'shorter-js/src/misc/passiveHandler.js';
import normalizeOptions from 'shorter-js/src/misc/normalizeOptions.js';

import spicrConnect from './util/spicrConnect.js';
import animateSliderLayers from './process/animateSliderLayers.js';

// options
import defaultSpicrOptions from './options/defaultOptions.js';

// SPICR DEFINITION
// ================
export default function Spicr(el, ops) {
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
