import queryElement from 'shorter-js/src/misc/queryElement.js'
import isMobile from 'shorter-js/src/boolean/isMobile.js'
import supportTouch from 'shorter-js/src/boolean/supportTouch.js'
import mouseHoverEvents from 'shorter-js/src/strings/mouseHoverEvents.js'

import spicrConnect from './util/spicrConnect.js'
import animateBackgrounds from './process/animateBackgrounds.js'
import animateSliderLayers from './process/animateSliderLayers.js'

// options
import defaultDuration from './options/defaultDuration.js'
import defaultInterval from './options/defaultInterval.js'
import defaultEasing from './options/defaultEasing.js'
// import defaultDelay from './options/defaultDelay.js'


// SPICR DEFINITION
// ================
export default function( element, options ) {
  element = queryElement(element);

  // set optional options
  options = options || {};
  
  // internal bind
  let self = this, tws = self.tweens = [],

    // SPICR UTILITIES
    pauseEvents = supportTouch && isMobile ? ['touchstart','touchend'] : mouseHoverEvents,

    // SPICR DATA API
    intervalData = element.getAttribute('data-interval'),
    pauseData = element.getAttribute('data-pause'),

    // options
    pauseOption = options.pause === false || pauseData === 'false' ? false : 'hover', // false / hover

    intervalOption = options.interval === false || parseInt(intervalData) === 0 || intervalData === 'false' ? 0
                    : typeof options.interval === 'number' ? options.interval
                    : isNaN(intervalData) ? defaultInterval // bootstrap carousel default interval
                    : parseInt(intervalData),

    // child elements
    slides = element.getElementsByClassName('item'),

    // controls
    controls = element.querySelectorAll('[data-slide]'),
    leftArrow = controls.length && controls[0], 
    rightArrow = controls.length && controls[1],
    
    // pages
    pageNav  = element.getElementsByClassName('spicr-pages',)[0],
    pages = pageNav && pageNav.querySelectorAll( "[data-slide-to]" ),
      
    // internal variables and / or constants
    timer = null,
    slideDirection = null,
    index = null,
    isAnimating = 0,

    // spicr type
    isSlider = element.classList.contains('spicr-slider'),
    isCarousel = element.classList.contains('spicr-carousel');

  // event handlers
  function pauseHandler () {
    if ( !element.classList.contains('paused')) {
      element.classList.add('paused');
      !isAnimating && (clearInterval(timer),timer=null)
    }
  }
  function resumeHandler () {      
    if ( element.classList.contains('paused') ) {
      element.classList.remove('paused');
      !isAnimating && (clearInterval(timer),timer=null)
      !isAnimating && self.cycle()
    }
  }
  function pageHandler (e) { //pages
    e.preventDefault();
    if ( isAnimating ) { return }
    let eventTarget = e.target,
        nextIndex = eventTarget && eventTarget.getAttribute('data-slide-to');
    
    if ( eventTarget && !eventTarget.classList.contains('active') && nextIndex ) {
      index = parseInt( nextIndex );
      self.slideTo( index )
    } 
    return false // if other eventTarget don't do anything
  }
  function controlsHandler (e) { // left | right
    e.preventDefault();
    if ( isAnimating ) { return }
    let eventTarget = this;

    if ( eventTarget === rightArrow || rightArrow.contains(eventTarget) ) {
      index++;
    } else if ( eventTarget === leftArrow || leftArrow.contains(eventTarget) ) {
      index--;
    }
    self.slideTo( index )
  }
  // private methods
  function toggleEvents(action){
    action = action ? 'addEventListener' : 'removeEventListener';
    if ( pauseOption === 'hover' && intervalOption ) {
      element[action](pauseEvents[0], pauseHandler)
      element[action](pauseEvents[1], resumeHandler)
    }
    if (rightArrow) { rightArrow[action]( "click", controlsHandler) }
    if (leftArrow) { leftArrow[action]( "click", controlsHandler) }
  
    // pages
    if (pageNav) { pageNav[action]("click", pageHandler) }
  }
  function setActivePage ( pageIndex ) {
    Array.from(pages).map(x=>x.classList.remove('active'))
    pageIndex && pageIndex.classList.add('active')
  }
  function beforeTween(next){
    index = next
    slides[next].classList.add('next')
    isAnimating = true;
  }
  function afterTween(activeIndex,nextItem) {
    slides[nextItem].classList.add('active');
    slides[nextItem].classList.remove('next');

    if (slides[activeIndex]) {
      slides[activeIndex].classList.remove('active');
    }

    setTimeout(()=>{
      if (isCarousel) {
        element.style.height = ''
      }
      spicrConnect.reset(element)
      isAnimating = false
      tws = []
      if ( intervalOption && !element.classList.contains('paused') ) {
        self.cycle()
      }
    },0)
  }

  // public methods
  this.getActiveIndex = function () {
    let activeIndex = element.getElementsByClassName('item active')[0];
    return Array.from(slides).indexOf(activeIndex);
  }
  this.cycle = function() {
    clearInterval(timer)
    timer = setTimeout(() => {
      index++;
      self.slideTo( index );
    }, intervalOption);
  }
  this.slideTo = function( nextActive ) {
    let activeIndex = this.getActiveIndex(); 
    if (activeIndex === nextActive || isAnimating) return;

    clearInterval(timer)
    timer = setTimeout(() => {

      // determine slideDirection first
      if ( (activeIndex < nextActive ) || (activeIndex === 0 && nextActive === slides.length -1 ) ) {
        slideDirection = 1; // left next
      } else if  ( (activeIndex > nextActive) || (activeIndex === slides.length - 1 && nextActive === 0 ) ) {
        slideDirection = 0; // right prev
      }
  
      // find the right next index 
      if ( nextActive < 0 ) { nextActive = slides.length - 1 } 
      else if ( nextActive >= slides.length ){ nextActive = 0 }
  
      // do slider work
      if ( isSlider ) {
        beforeTween(nextActive) // always before creating tween objects

        let animateBg = activeIndex !== -1 ? animateBackgrounds(slides,activeIndex,nextActive) : animateBackgrounds(slides,activeIndex),
            animateActiveLayers = activeIndex !== -1 ? animateSliderLayers(slides[activeIndex]) : animateSliderLayers(slides[0]),
            animateNextLayers = activeIndex !== -1 && animateSliderLayers(slides[nextActive]),
            lastTweens = []
  
        if (activeIndex === -1){
          if (animateBg.length) {
            lastTweens = animateBg
            tws = tws.concat( animateBg )
            if (animateActiveLayers.length) {
              lastTweens = animateActiveLayers
              animateBg[animateBg.length - 1].chain( animateActiveLayers )
            }
          }

          if (lastTweens.length) {
            lastTweens[lastTweens.length - 1]._onComplete = ()=> afterTween(activeIndex,nextActive)
          }

          tws.length && tws[0].start() 
        } else {

          if (animateActiveLayers.length){
            tws = tws.concat(animateActiveLayers)
            lastTweens = animateActiveLayers
          }

          if (animateBg.length){
            tws = tws.concat(animateBg)
            lastTweens.length && lastTweens[lastTweens.length - 1].chain(animateBg)
            lastTweens = animateBg
          } 

          if (animateNextLayers.length){
            tws = tws.concat(animateNextLayers)
            lastTweens.length && lastTweens[lastTweens.length - 1].chain(animateNextLayers)
            lastTweens = animateNextLayers
          }

          if (lastTweens.length) {
            lastTweens[lastTweens.length - 1]._onComplete = ()=> afterTween(activeIndex,nextActive)
          }
          animateActiveLayers.length ? animateActiveLayers.map(x=>x.start())
                                     : animateBg.length ? animatetBg.map(x=>x.start())
                                     : animateNextLayers.length ? animateNextLayers.map(x=>x.start()) : 0
        }
        pages && setActivePage( pages[nextActive] )
        if (!lastTweens.length) {
          afterTween(activeIndex,nextActive)
        }
  
      // do carousel work
      } else if ( isCarousel ) { 
        beforeTween(nextActive) // always before creating tween objects
  
        tws = spicrConnect.carousel(element,slides,activeIndex,nextActive,slideDirection)

        if (tws.length){
          tws[tws.length-1]._onComplete = () => afterTween(activeIndex,nextActive)
          if ( slides[activeIndex] && slides[activeIndex].offsetHeight !== slides[nextActive].offsetHeight) {
            let easing = element.getAttribute('data-easing'),
                duration = element.getAttribute('data-duration');
            tws.push( spicrConnect.fromTo(element, 
              { height: parseFloat(getComputedStyle(slides[activeIndex]).height) }, 
              { height: parseFloat(getComputedStyle(slides[nextActive]).height) }, 
              { easing: easing ? easing : defaultEasing, 
                duration: !isNaN(duration) ? parseInt(duration) : defaultDuration}))
          }
          tws.map(x=>x.start())
        } else {
          afterTween(activeIndex,nextActive)
        }
        pages && setActivePage( pages[nextActive] )
      }
    },1)
  }
  this.dispose = function(){
    isAnimating && tws.map(x=>x.stop())
    spicrConnect.reset(element)
    toggleEvents()
    clearInterval( timer )
    delete element.Spicr
  }

  // remove previous init
  element.Spicr && element.Spicr.dispose();

  // INIT
  // next/prev
  toggleEvents(1)
  element.Spicr = self

  if ( !element.getElementsByClassName('item active').length ) {
    self.slideTo(0);
  } else if (intervalOption){
    self.cycle()
  }
}