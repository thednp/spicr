import transformProperty from 'kute.js/src/util/transformProperty.js';
import transformOriginLegacy from '../util/transformOriginLegacy.js';

export default function resetAllLayersLegacy(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
    x.style.opacity = '';
    x.style[transformProperty] = '';
    x.style[transformOriginLegacy] = '';
  });
}
