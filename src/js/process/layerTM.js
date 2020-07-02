import spicrConnect from '../util/spicrConnect.js'
import getLayerData from './getLayerData.js'
import defaultDelay from '../options/defaultDelay.js'

// tweenLayer to work with KUTE.js transformMatrix component
export default function(elem,isInAnimation,nextData) {
  let data = nextData ? nextData : getLayerData(elem),
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

  easing = /InOut/.test(easing) || nextData ? easing : ( isInAnimation ? easing.replace('In','Out') : easing.replace('Out','In') ) // easing
  delay = isInAnimation ? delay : 0;
  duration = isInAnimation ? duration : !isBg ? duration*1.5 : duration;
  opacity = !isInAnimation && isBg && nextData ? 0 : opacity;

  if (opacity) {
    from.opacity = isInAnimation?0:1; 
    to.opacity = isInAnimation?1:0;
  }

  if ( scale || translate || rotate) {
    from.transform = {}
    to.transform = {}
    if (origin) { // origin axis can be 0
      let originX = 'x' in origin ? (/%/.test(origin.x) ? origin.x : origin.x + 'px') : '50%',
          originY = 'y' in origin ? (/%/.test(origin.y) ? origin.y : origin.y + 'px') : '50%',
          originZ = 'z' in origin ? origin.z + 'px' : ''
      elem.style.transformOrigin = `${originX} ${originY} ${originZ}` 
    }
  }

  if ( scale ) { 
    from.transform.scale3d  = isInAnimation ? [scale,scale,scale] : [1,1,1]; 
    to.transform.scale3d    = isInAnimation ? [1,1,1] : [scale,scale,scale]; 
  }
  if ( translate ) { 
    let fromTranslateX = isInAnimation && translate.x ? translate.x : 0, toTranslateX = translate.x && !isInAnimation ? translate.x : 0,
        fromTranslateY = isInAnimation && translate.y ? translate.y : 0, toTranslateY = translate.y && !isInAnimation ? translate.y : 0,
        fromTranslateZ = isInAnimation && translate.z ? translate.z : 0, toTranslateZ = translate.z && !isInAnimation ? translate.z : 0 // not supported on IE9-
    from.transform.translate3d = [fromTranslateX,fromTranslateY,fromTranslateZ]
    to.transform.translate3d = [toTranslateX,toTranslateY,toTranslateZ] 
  }
  if ( rotate ) {
    let fromRotateX = isInAnimation && rotate.x ? rotate.x : 0, toRotateX = !isInAnimation && rotate.x ? rotate.x : 0,
        fromRotateY = isInAnimation && rotate.y ? rotate.y : 0, toRotateY = !isInAnimation && rotate.y ? rotate.y : 0,
        fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0, toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;
    from.transform.rotate3d = [fromRotateX,fromRotateY,fromRotateZ]
    to.transform.rotate3d = [toRotateX,toRotateY,toRotateZ]
  }
  if (!opacity && !rotate && !translate && !scale){
    duration = 50
    delay = 0
  }
  tweenOptions = { easing: easing, duration: duration, delay: delay };

  return spicrConnect.fromTo(elem, from, to, tweenOptions)
}