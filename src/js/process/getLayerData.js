import processLayerData from './processLayerData.js';
import defaultSpicrOptions from '../options/defaultOptions.js';

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

export default function getLayerData(elem) {
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
