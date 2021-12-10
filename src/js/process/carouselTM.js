import spicrConnect from '../util/spicrConnect';
import getLayers from './getLayers';

import defaultSpicrOptions from '../options/defaultOptions';

import getLayerData from './getLayerData';
import processLayerData from './processLayerData';

/**
 * TweenCarousel to work with KUTE transformMatrix component which returns
 * an `Array` of Tween objects for layers of the current and next active item.
 * @param {Element} elem
 * @param {Element[]} items
 * @param {number} active
 * @param {number} next
 * @param {string} direction animation direction
 * @returns {KUTE.TweenBase[]} the `Array` of tween objects
 */
export default function carouselTM(elem, items, active, next, direction) {
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
    fromActive.transform.scale3d = [1, 1, 1];
    toActive.transform.scale3d = [scale, scale, scale];
    fromNext.transform.scale3d = [scale, scale, scale];
    toNext.transform.scale3d = [1, 1, 1];
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
