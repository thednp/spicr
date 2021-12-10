import transformPropertyLegacy from '../util/transformPropertyLegacy';
import transformOriginLegacy from '../util/transformOriginLegacy';

/**
 * Reset all layers for a Spicr element or a single slide.
 * This function is to be used with legacy builds.
 *
 * @param {Element} element target Spicr element or slide
 */
export default function resetAllLayersLegacy(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
    x.style.opacity = '';
    x.style[transformPropertyLegacy] = '';
    x.style[transformOriginLegacy] = '';
  });
}
