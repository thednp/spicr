/**
 * Returns an `Array` with all layers from a slide / Spicr element.
 * @param {Element} elem target
 * @returns {Element[]} an `Array` of Spicr layers
 */
export default function getLayers(elem) {
  return Array.from(elem.getElementsByClassName('spicr-layer'));
}
