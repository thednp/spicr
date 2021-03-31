import support3DTransform from 'shorter-js/src/boolean/support3DTransform.js';
import spicrConnect from '../util/spicrConnect.js';
import getLayers from './getLayers.js';

import defaultSpicrOptions from '../options/defaultOptions.js';

import transformOriginLegacy from '../util/transformOriginLegacy.js';
import getLayerData from './getLayerData.js';
import processLayerData from './processLayerData.js';

// tweenCarousel to work with KUTE.js transformFunctions component
export default function carouselLegacy(elem, items, active, next, direction) {
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
    const initialTranslate = support3DTransform ? [0, 0, 0] : [0, 0];
    const translateProp = support3DTransform ? 'translate3d' : 'translate';
    fromActive.transform[translateProp] = initialTranslate;
    let translateX = 0;
    let translateY = 0;
    let translateZ = 0;
    if ('x' in translate) translateX = direction ? -translate.x : translate.x;
    if ('y' in translate) translateY = direction ? -translate.y : translate.y;
    if ('Z' in translate) translateZ = direction ? -translate.z : translate.z;
    toActive.transform[translateProp] = support3DTransform
      ? [translateX, translateY, translateZ]
      : [translateX, translateY];
    let fromTX = 0;
    let fromTY = 0;
    let fromTZ = 0;
    if ('x' in translate) fromTX = direction ? translate.x : -translate.x;
    if ('y' in translate) fromTY = direction ? translate.y : -translate.y;
    if ('Z' in translate) fromTZ = direction ? translate.z : -translate.z;
    fromNext.transform[translateProp] = support3DTransform
      ? [fromTX, fromTY, fromTZ]
      : [fromTX, fromTY];
    toNext.transform[translateProp] = initialTranslate;
  }
  if (rotate) {
    const initialRotate = support3DTransform ? [0, 0, 0] : 0;
    const rotateProp = support3DTransform ? 'rotate3d' : 'rotate';
    fromActive.transform[rotateProp] = initialRotate;
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    if ('x' in rotate) rotX = direction ? -rotate.x : rotate.x;
    if ('y' in rotate) rotY = direction ? -rotate.y : rotate.y;
    if ('Z' in rotate) rotZ = direction ? -rotate.z : rotate.z;

    toActive.transform[rotateProp] = support3DTransform
      ? [rotX, rotY, rotZ]
      : rotZ;

    let fromRX = 0;
    let fromRY = 0;
    let fromRZ = 0;
    if ('x' in rotate) fromRX = direction ? rotate.x : -rotate.x;
    if ('y' in rotate) fromRY = direction ? rotate.y : -rotate.y;
    if ('Z' in rotate) fromRZ = direction ? rotate.z : -rotate.z;

    fromNext.transform[rotateProp] = support3DTransform
      ? [fromRX, fromRY, fromRZ]
      : fromRZ;
    toNext.transform[rotateProp] = initialRotate;
  }

  if (!direction) {
    if (activeLayers.length) activeLayers.reverse();
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
      if (origin && support3DTransform) { // origin axis can be 0
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
        x.style[transformOriginLegacy] = `${originX} ${originY}${originZ}`;
      }
    });
  }

  nextLayers.forEach((x, i) => {
    optionsNext.delay = (delay + 50) * i;
    carouselTweens.push(spicrConnect.fromTo(x, fromNext, toNext, optionsNext));
    if (origin && support3DTransform) {
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
      x.style[transformOriginLegacy] = `${originX} ${originY}${originZ}`;
    }
  });

  return carouselTweens;
}
