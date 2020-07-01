import spicrConnect from '../util/spicrConnect.js'
import getLayers from './getLayers.js'

import defaultDuration from '../options/defaultDuration.js'
import defaultDelay from '../options/defaultDelay.js'
import getLayerData from './getLayerData.js'
import processLayerData from './processLayerData.js'

// tweenCarousel to work with KUTE.js transformMatrix component
export default function(elem,items,active,next,direction) {
  let carouselTweens = [],
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
    opacity = data.opacity, // opacity is optional | boolean
    duration = data.duration||defaultDuration,
    delay = data.delay||parseInt(duration)/2,
    easing = data.easing,
    optionsActive, optionsNext;

  if (opacity) {
    fromActive.opacity  = 1; toActive.opacity  = 0;
    fromNext.opacity    = 0; toNext.opacity    = 1;
  }

  if ( scale || translate || rotate) {
    fromActive.transform = {}
    toActive.transform = {}
    fromNext.transform = {}
    toNext.transform = {}
  }

  if ( scale ) { 
    fromActive.transform.scale3d = [1,1,1]
    toActive.transform.scale3d = [scale,scale,scale]
    fromNext.transform.scale3d = [scale,scale,scale]
    toNext.transform.scale3d = [1,1,1]
  }

  if ( translate ) {
    fromActive.transform.translate3d = [0,0,0]
    toActive.transform.translate3d = [
      translate.x ? (direction?-translate.x:translate.x) : 0,
      translate.y ? (direction?-translate.y:translate.y) : 0,
      translate.z ? (direction?-translate.z:translate.z) : 0
    ]
    fromNext.transform.translate3d = [
      translate.x ? (direction?translate.x:-translate.x) : 0,
      translate.y ? (direction?translate.y:-translate.y) : 0,
      translate.z ? (direction?translate.z:-translate.z) : 0
    ]
    toNext.transform.translate3d = [0,0,0]
  }  
  if ( rotate ) { 
    fromActive.transform.rotate3d = [0,0,0]
    toActive.transform.rotate3d = [
      rotate.x ? (direction?-rotate.x:rotate.x) : 0,
      rotate.y ? (direction?-rotate.y:rotate.y) : 0,
      rotate.z ? (direction?-rotate.z:rotate.z) : 0
    ]
    fromNext.transform.rotate3d = [
      rotate.x ? (direction?rotate.x:-rotate.x) : 0,
      rotate.y ? (direction?rotate.y:-rotate.y) : 0,
      rotate.z ? (direction?rotate.z:-rotate.z) : 0
    ]
    toNext.transform.rotate3d = [0,0,0]
  }
  
  if (!direction) {
    activeLayers && activeLayers.reverse()
    nextLayers.reverse()
  }

  if (!opacity && !rotate && !translate && !scale){
    duration = 50
    delay = 0
  }

  optionsActive = optionsNext = { easing: easing, duration: duration };

  activeLayers && activeLayers.map((x,i)=>{
    optionsActive.delay = defaultDelay*i
    carouselTweens.push( spicrConnect.fromTo(x, fromActive, toActive, optionsActive ) );
    if (origin){
      let o = origin ? processLayerData(x,origin) : {}
      x.style.transformOrigin = `${'x'in o?o.x+'px':'50%'} ${'y'in o?o.y+'px':'50%'} ${'z'in o?o.z+'px':''}`
    }
  })
  nextLayers.map((x,i)=>{
    optionsNext.delay = (delay+50)*i
    carouselTweens.push( spicrConnect.fromTo(x, fromNext, toNext, optionsNext ) );
    if (origin){
      let o = origin ? processLayerData(x,origin) : {}
      x.style.transformOrigin = `${'x'in o?o.x+'px':'50%'} ${'y'in o?o.y+'px':'50%'} ${'z'in o?o.z+'px':''}`
    }
  })

  return carouselTweens     
}