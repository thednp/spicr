/**
 * Reset all layers for a Spicr element or a single slide.
 * @param {Element} element target Spicr element or slide
 */
export default function resetAllLayers(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
    x.style.opacity = '';
    x.style.transform = '';
    x.style.transformOrigin = '';
  });
}
