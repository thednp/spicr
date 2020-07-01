import spicrConnect from '../util/spicrConnect.js'
import getLayers from './getLayers.js'

import defaultDuration from '../options/defaultDuration.js'
import defaultDelay from '../options/defaultDelay.js'

import support3DTransform from 'shorter-js/src/boolean/support3DTransform.js'
import transformOriginLegacy from '../util/transformOriginLegacy.js'
import getLayerData from './getLayerData.js'
import processLayerData from './processLayerData.js'


// tweenCarousel to work with KUTE.js transformFunctions component
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
    opacity = data.opacity, // opacity is boolean and optional
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
    fromActive.transform.scale = 1; toActive.transform.scale = scale; 
    fromNext.transform.scale = scale; toNext.transform.scale = 1; 
  }
  
  if ( translate ) {
    let initialTranslate = support3DTransform ? [0,0,0] : [0,0],
        translateProp = support3DTransform ? 'translate3d' : 'translate'
    fromActive.transform[translateProp] = initialTranslate
    toActive.transform[translateProp] = support3DTransform ? [
      translate.x ? (direction?-translate.x:translate.x) : 0,
      translate.y ? (direction?-translate.y:translate.y) : 0,
      translate.z ? (direction?-translate.z:translate.z) : 0
    ] : [
      translate.x ? (direction?-translate.x:translate.x) : 0,
      translate.y ? (direction?-translate.y:translate.y) : 0
    ]
    fromNext.transform[translateProp] = support3DTransform ? [
      translate.x ? (direction?translate.x:-translate.x) : 0,
      translate.y ? (direction?translate.y:-translate.y) : 0,
      translate.z ? (direction?translate.z:-translate.z) : 0
    ] : [
      translate.x ? (direction?translate.x:-translate.x) : 0,
      translate.y ? (direction?translate.y:-translate.y) : 0
    ]
    toNext.transform[translateProp] = initialTranslate
  }  
  if ( rotate ) { 
    let initialRotate = support3DTransform ? [0,0,0] : 0,
        rotateProp = support3DTransform ? 'rotate3d' : 'rotate',
        toActiveRotateX = rotate.x ? (direction?-rotate.x:rotate.x) : 0,
        toActiveRotateY = rotate.y ? (direction?-rotate.y:rotate.y) : 0,
        toActiveRotateZ = rotate.z ? (direction?-rotate.z:rotate.z) : 0,
        fromNextRotateX = rotate.x ? (direction?rotate.x:-rotate.x) : 0,
        fromNextRotateY = rotate.y ? (direction?rotate.y:-rotate.y) : 0,
        fromNextRotateZ = rotate.z ? (direction?rotate.z:-rotate.z) : 0

    fromActive.transform[rotateProp] = initialRotate
    toActive.transform[rotateProp] = support3DTransform ? [toActiveRotateX,toActiveRotateY,toActiveRotateZ] 
                                    : toActiveRotateZ
    fromNext.transform[rotateProp] = support3DTransform ? [fromNextRotateX,fromNextRotateY,fromNextRotateZ]
                                    : fromNextRotateZ
    toNext.transform[rotateProp] = initialRotate  
  }

  if (!opacity && !rotate && !translate && !scale){
    duration = 50
    delay = 0
  }
  optionsActive = optionsNext = { easing: easing, duration: duration };

  if (!direction) {
    activeLayers.length && activeLayers.reverse()
    nextLayers.reverse()
  }
  activeLayers && activeLayers.map((x,i)=>{
    optionsActive.delay = defaultDelay*i
    carouselTweens.push( spicrConnect.fromTo(x, fromActive, toActive, optionsActive ) );
    if (origin && support3DTransform){
      let o = origin ? processLayerData(x,origin) : {}
      x.style[transformOriginLegacy] = `${'x'in o?o.x+'px':'50%'} ${'y'in o?o.y+'px':'50%'} ${'z'in o?o.z+'px':''}`
    }
  })

  nextLayers.map((x,i)=>{
    optionsNext.delay = (delay+50)*i
    carouselTweens.push( spicrConnect.fromTo(x, fromNext, toNext, optionsNext ) );
    if (origin && support3DTransform){
      let o = origin ? processLayerData(x,origin) : {}
      x.style[transformOriginLegacy] = `${'x'in o?o.x+'px':'50%'} ${'y'in o?o.y+'px':'50%'} ${'z'in o?o.z+'px':''}`
    }    
  })

  return carouselTweens     
}