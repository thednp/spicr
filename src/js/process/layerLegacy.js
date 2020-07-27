import spicrConnect from '../util/spicrConnect.js'
import support3DTransform from 'shorter-js/src/boolean/support3DTransform.js'
import transformOriginLegacy from '../util/transformOriginLegacy.js'
import getLayerData from './getLayerData.js'
import defaultDelay from '../options/defaultDelay.js'

// tweenLayer to work with KUTE.js transformFunctions component
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
    if (origin && support3DTransform){
      let originX = 'x' in origin ? (/%/.test(origin.x) ? origin.x : origin.x + 'px') : '50%',
          originY = 'y' in origin ? (/%/.test(origin.y) ? origin.y : origin.y + 'px') : '50%',
          originZ = 'z' in origin ? origin.z + 'px' : ''
      elem.style[transformOriginLegacy] = `${originX} ${originY} ${originZ}` // origin axis can be 0
    }
  }

  if ( scale ) { 
    from.transform.scale = isInAnimation?scale:1; 
    to.transform.scale = isInAnimation?1:scale; 
  }

  if ( translate ) { 
    let fromTranslateX = isInAnimation && translate.x ? translate.x : 0, toTranslateX = translate.x && !isInAnimation ? translate.x : 0,
        fromTranslateY = isInAnimation && translate.y ? translate.y : 0, toTranslateY = translate.y && !isInAnimation ? translate.y : 0,
        fromTranslateZ = isInAnimation && translate.z ? translate.z : 0, toTranslateZ = translate.z && !isInAnimation ? translate.z : 0 // not supported on IE9-

    if (support3DTransform){
      from.transform.translate3d = [fromTranslateX,fromTranslateY,fromTranslateZ]
      to.transform.translate3d = [toTranslateX,toTranslateY,toTranslateZ] 
    } else {
      from.transform.translate = [fromTranslateX,fromTranslateY]
      to.transform.translate = [toTranslateX,toTranslateY] 
    }
  }
  if ( rotate ) {
    let fromRotateX = isInAnimation && rotate.x ? rotate.x : 0, toRotateX = !isInAnimation && rotate.x ? rotate.x : 0,
        fromRotateY = isInAnimation && rotate.y ? rotate.y : 0, toRotateY = !isInAnimation && rotate.y ? rotate.y : 0,
        fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0, toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;

    if (support3DTransform){
      from.transform.rotate3d = [fromRotateX,fromRotateY,fromRotateZ]
      to.transform.rotate3d = [toRotateX,toRotateY,toRotateZ]
    } else if (rotate.z){
      from.transform.rotate = fromRotateZ
      to.transform.rotate = toRotateZ
    }
  }

  if (!opacity && !rotate && !translate && !scale){
    duration = 50
    delay = 0
  }
  tweenOptions = { easing: easing, duration: duration, delay: delay };

  return spicrConnect.fromTo(elem, from, to, tweenOptions)
}