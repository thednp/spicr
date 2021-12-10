import support3DTransform from 'shorter-js/src/boolean/support3DTransform';
import transformOriginLegacy from '../util/transformOriginLegacy';
import spicrConnect from '../util/spicrConnect';
import getLayerData from './getLayerData';
import defaultSpicrDefaults from '../options/defaultOptions';

/**
 * Returns a tween object for a single layer for TransformLegacy component.
 * @param {Element} elem target layer
 * @param {number | boolean} isInAnimation parent slide is next
 * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
 * @returns {KUTE.TweenBase} a new tween object
 */
export default function layerLegacy(elem, isInAnimation, nextData) {
  const data = nextData || getLayerData(elem);
  const isBg = elem.classList.contains('item-bg');
  const from = {};
  const to = {};
  const { translate } = data;
  const { rotate } = data;
  const { scale } = data;
  let { opacity } = data;
  const { origin } = data;
  let { duration } = data;
  let delay = data.delay || (!isBg ? defaultSpicrDefaults.delay : 0);
  let { easing } = data;

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
    if (origin && support3DTransform) {
      let originX = '50%';
      let originY = '50%';
      const originZ = 'z' in origin ? ` ${origin.z}px` : '';

      if ('x' in origin) {
        originX = /%/.test(origin.x) ? origin.x : `${origin.x}px`;
      }
      if ('y' in origin) {
        originY = /%/.test(origin.y) ? origin.y : `${origin.y}px`;
      }

      elem.style[transformOriginLegacy] = `${originX} ${originY}${originZ}`;
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
    const fromTranslateZ = isInAnimation && translate.z ? translate.z : 0; // not supported on IE9-
    const toTranslateZ = translate.z && !isInAnimation ? translate.z : 0;

    if (support3DTransform) {
      from.transform.translate3d = [fromTranslateX, fromTranslateY, fromTranslateZ];
      to.transform.translate3d = [toTranslateX, toTranslateY, toTranslateZ];
    } else {
      from.transform.translate = [fromTranslateX, fromTranslateY];
      to.transform.translate = [toTranslateX, toTranslateY];
    }
  }
  if (rotate) {
    const fromRotateX = isInAnimation && rotate.x ? rotate.x : 0;
    const toRotateX = !isInAnimation && rotate.x ? rotate.x : 0;
    const fromRotateY = isInAnimation && rotate.y ? rotate.y : 0;
    const toRotateY = !isInAnimation && rotate.y ? rotate.y : 0;
    const fromRotateZ = isInAnimation && rotate.z ? rotate.z : 0;
    const toRotateZ = !isInAnimation && rotate.z ? rotate.z : 0;

    if (support3DTransform) {
      from.transform.rotate3d = [fromRotateX, fromRotateY, fromRotateZ];
      to.transform.rotate3d = [toRotateX, toRotateY, toRotateZ];
    } else if (rotate.z) {
      from.transform.rotate = fromRotateZ;
      to.transform.rotate = toRotateZ;
    }
  }

  if (!opacity && !rotate && !translate && !scale) {
    duration = 50;
    delay = 0;
  }

  return spicrConnect.fromTo(elem, from, to, { easing, duration, delay });
}
